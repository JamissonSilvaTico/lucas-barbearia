import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { TrashIcon } from "../../components/icons/Icon";

const AdminDashboardPage: React.FC = () => {
  const { appointments, deleteAppointment, services, isLoading } = useData();
  const [filterService, setFilterService] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await deleteAppointment(id);
      } catch (err) {
        console.error(err);
        alert("Falha ao excluir agendamento.");
      }
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => filterService === "all" || a.serviceId === filterService)
      .filter((a) => !filterDate || a.date === filterDate)
      .sort(
        (a, b) =>
          new Date(b.date + " " + b.time).getTime() -
          new Date(a.date + " " + a.time).getTime()
      );
  }, [appointments, filterService, filterDate]);

  const totalRevenue = useMemo(() => {
    return filteredAppointments.reduce((total, app) => {
      const service = services.find((s) => s.id === app.serviceId);
      return total + (service?.price || 0);
    }, 0);
  }, [filteredAppointments, services]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-primary mb-6">
        Agendamentos
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-dark-1 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-light-3 mb-1">
            Filtrar por Serviço
          </label>
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="w-full bg-dark-3 p-2 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
          >
            <option value="all">Todos os Serviços</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-light-3 mb-1">
            Filtrar por Data
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-dark-3 p-2 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
          />
        </div>
        <div className="bg-dark-3 p-4 rounded-md flex flex-col justify-center">
          <p className="text-sm text-light-3">Faturamento Total (Filtro)</p>
          <p className="text-2xl font-bold text-brand-secondary">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-dark-1 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="text-center p-8">Carregando agendamentos...</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-dark-3">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Serviço</th>
                  <th className="p-4">Data e Hora</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => {
                  const service = services.find((s) => s.id === app.serviceId);
                  const appointmentDate = new Date(`${app.date} ${app.time}`);
                  return (
                    <tr
                      key={app.id}
                      className="border-b border-dark-3 hover:bg-dark-3/50"
                    >
                      <td className="p-4">{app.clientName}</td>
                      <td className="p-4">{service?.name || "N/A"}</td>
                      <td className="p-4">
                        {(() => {
                          // Tenta obter apenas a parte da data (YYYY-MM-DD)
                          const rawDateOnly = app.date
                            ? app.date.split("T")[0]
                            : "";
                          const appointmentDate = new Date(rawDateOnly);

                          // Verifica se a data é válida antes de formatar
                          if (isNaN(appointmentDate.getTime())) {
                            return <div>Data Inválida</div>;
                          }

                          const dataFormatada =
                            appointmentDate.toLocaleDateString("pt-BR");

                          // Remove segundos se existirem (ex: 14:30:00 vira 14:30)
                          const horaFormatada = app.time.substring(0, 5);

                          return (
                            <div>
                              {/* Data: 08/10/2025 */}
                              <div>{dataFormatada}</div>
                              {/* Hora: 14:30 */}
                              <div className="text-sm text-light-3">
                                {horaFormatada}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4">{app.clientPhone}</td>
                      <td className="p-4">
                        R$ {service?.price.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!isLoading && filteredAppointments.length === 0 && (
            <p className="text-center p-8 text-light-3">
              Nenhum agendamento encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
