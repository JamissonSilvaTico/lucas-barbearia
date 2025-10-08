const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// 🚨 NOVO: Importa a função de envio de e-mail
const { sendAppointmentConfirmation } = require("./server/utils/mailer.cjs");

if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração do Banco de Dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Middlewares
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
};
app.use(cors(corsOptions));
app.use(express.json());

// Função para inicializar o banco de dados
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Tabela de serviços

    await client.query(`
CREATE TABLE IF NOT EXISTS services (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
duration INTEGER NOT NULL
);
`); // Tabela de agendamentos

    await client.query(`
CREATE TABLE IF NOT EXISTS appointments (
id SERIAL PRIMARY KEY,
"clientName" VARCHAR(100) NOT NULL,
"clientPhone" VARCHAR(20) NOT NULL,
"clientInstagram" VARCHAR(100),
"serviceId" INTEGER REFERENCES services(id) ON DELETE SET NULL,
date DATE NOT NULL,
time TIME NOT NULL,
"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`); // Tabela de configurações (conteúdo da home, senha)

    await client.query(`
CREATE TABLE IF NOT EXISTS settings (
id INTEGER PRIMARY KEY DEFAULT 1,
title VARCHAR(255),
subtitle VARCHAR(255),
description TEXT,
"ctaButtonLink" VARCHAR(255),
"adminPassword" VARCHAR(100)
);
`); // Seeding inicial (apenas se as tabelas estiverem vazias)

    const servicesCount = await client.query("SELECT COUNT(*) FROM services");
    if (servicesCount.rows[0].count === "0") {
      await client.query(`
 INSERT INTO services (name, price, duration) VALUES
('Corte de Cabelo', 40, 45),
('Barba', 30, 30),
('Corte e Barba', 65, 75),
('Pezinho', 15, 15);
`);
    }

    const settingsCount = await client.query("SELECT COUNT(*) FROM settings");
    if (settingsCount.rows[0].count === "0") {
      await client.query(`
INSERT INTO settings (title, subtitle, description, "ctaButtonLink", "adminPassword") VALUES
('Lucas Barbearia', 'Estilo e Precisão em Cada Corte', 'Experimente a combinação perfeita de tradição e modernidade. Nossos barbeiros especializados estão prontos para oferecer o melhor serviço, garantindo um visual impecável e uma experiência única.', 'https://wa.me/5511999999999', 'admin123');
`);
    }

    await client.query("COMMIT");
    console.log("Database initialized successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error initializing database:", err);
    process.exit(1); // Sai se o DB não puder ser inicializado
  } finally {
    client.release();
  }
};

// Helper para analisar dados antes de enviar ao cliente.
const parseDataForClient = (rows) =>
  rows.map((row) => {
    const parsedRow = { ...row };
    if (parsedRow.id) parsedRow.id = String(parsedRow.id);
    if (parsedRow.serviceId) parsedRow.serviceId = String(parsedRow.serviceId);
    if (parsedRow.price && typeof parsedRow.price === "string") {
      parsedRow.price = parseFloat(parsedRow.price);
    }
    return parsedRow;
  });

// --- ROTAS DA API ---

// Rota de Health Check para o Render
app.get("/api/health", (req, res) => res.status(200).send("OK"));

// Rota para buscar todos os dados iniciais
app.get("/api/data", async (req, res) => {
  try {
    const servicesRes = await pool.query("SELECT * FROM services ORDER BY id");
    const appointmentsRes = await pool.query(
      'SELECT * FROM appointments ORDER BY "createdAt" DESC'
    );
    const settingsRes = await pool.query(
      'SELECT title, subtitle, description, "ctaButtonLink" FROM settings WHERE id = 1'
    );

    res.json({
      services: parseDataForClient(servicesRes.rows),
      appointments: parseDataForClient(appointmentsRes.rows),
      homeContent: settingsRes.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch initial data" });
  }
});

// Autenticação
app.post("/api/login", async (req, res) => {
  const { password } = req.body;
  try {
    const result = await pool.query(
      'SELECT "adminPassword" FROM settings WHERE id = 1'
    );
    if (result.rows.length > 0 && result.rows[0].adminPassword === password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// --- Serviços ---
app.post("/api/services", async (req, res) => {
  const { name, price, duration } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO services (name, price, duration) VALUES ($1, $2, $3) RETURNING *",
      [name, price, duration]
    );
    res.status(201).json(parseDataForClient(result.rows)[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create service" });
  }
});

app.put("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, duration } = req.body;
  try {
    const result = await pool.query(
      "UPDATE services SET name = $1, price = $2, duration = $3 WHERE id = $4 RETURNING *",
      [name, price, duration, parseInt(id)]
    );
    res.json(parseDataForClient(result.rows)[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update service" });
  }
});

app.delete("/api/services/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM services WHERE id = $1", [parseInt(id)]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

// --- Agendamentos ---
app.post("/api/appointments", async (req, res) => {
  const { clientName, clientPhone, clientInstagram, serviceId, date, time } =
    req.body;
  try {
    // 1. Inserir no DB (salvar o agendamento)
    const result = await pool.query(
      'INSERT INTO appointments ("clientName", "clientPhone", "clientInstagram", "serviceId", date, time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        clientName,
        clientPhone,
        clientInstagram,
        parseInt(serviceId),
        date,
        time,
      ]
    );
    const novoAgendamento = parseDataForClient(result.rows)[0];

    // 2. Buscar nome do serviço para o e-mail
    const serviceRes = await pool.query(
      "SELECT name FROM services WHERE id = $1",
      [parseInt(serviceId)]
    );
    const nomeServico = serviceRes.rows[0]?.name || "Serviço Indefinido";

    // 3. 📧 CHAMAR O ENVIO DE E-MAIL AUTOMATICAMENTE
    // Não usamos 'await' aqui para que o cliente receba a confirmação rápida, mesmo se o e-mail falhar.
    sendAppointmentConfirmation(novoAgendamento, nomeServico);

    // 4. Responder ao frontend
    res.status(201).json(novoAgendamento);
  } catch (err) {
    console.error("Erro no agendamento ou envio de email:", err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM appointments WHERE id = $1", [parseInt(id)]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

// --- Configurações ---
app.put("/api/content", async (req, res) => {
  const { title, subtitle, description, ctaButtonLink } = req.body;
  try {
    const result = await pool.query(
      'UPDATE settings SET title = $1, subtitle = $2, description = $3, "ctaButtonLink" = $4 WHERE id = 1 RETURNING title, subtitle, description, "ctaButtonLink"',
      [title, subtitle, description, ctaButtonLink]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update content" });
  }
});

app.put("/api/password", async (req, res) => {
  const { newPassword } = req.body;
  try {
    await pool.query('UPDATE settings SET "adminPassword" = $1 WHERE id = 1', [
      newPassword,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  initializeDatabase();
  console.log(`Server is running on port ${PORT}`);
});
