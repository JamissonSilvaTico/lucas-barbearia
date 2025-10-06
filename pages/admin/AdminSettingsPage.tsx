import React, { useState, useMemo, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from "../../components/icons/Icon";
import { HomePageContent } from "../../types";

const AdminSettingsPage: React.FC = () => {
  const { homeContent, updateHomeContent } = useData();
  const { updateAdminPassword } = useAuth();

  const [contentForm, setContentForm] = useState<HomePageContent>({
    title: "",
    subtitle: "",
    description: "",
    ctaButtonLink: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [contentMessage, setContentMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (homeContent) {
      setContentForm(homeContent);
    }
  }, [homeContent]);

  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({
    title: false,
    subtitle: false,
    description: false,
  });
  const [generationError, setGenerationError] = useState("");

  // FIX: Updated GoogleGenAI initialization to use a non-null assertion for the API key,
  // ensuring compliance with guidelines and improving type safety.
  const ai = useMemo(
    () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! }),
    []
  );

  const handleGenerateContent = async (
    field: "title" | "subtitle" | "description"
  ) => {
    setIsGenerating((prev) => ({ ...prev, [field]: true }));
    setGenerationError("");
    try {
      let prompt = "";
      switch (field) {
        case "title":
          prompt = `Gere um título chamativo para uma barbearia moderna chamada '${
            homeContent?.title || "Lucas Barbearia"
          }'. Mantenha-o curto e estiloso. Retorne apenas o texto do título.`;
          break;
        case "subtitle":
          prompt = `Gere um subtítulo atraente para um site de barbearia com o título '${contentForm.title}'. Deve enfatizar estilo, precisão e uma experiência premium. Retorne apenas o texto do subtítulo.`;
          break;
        case "description":
          prompt = `Gere um parágrafo descritivo para a página inicial de uma barbearia chamada '${
            homeContent?.title || "Lucas Barbearia"
          }'. Mencione a mistura de tradição e modernidade, barbeiros especializados e uma experiência única para o cliente. O tom deve ser convidativo e profissional. Retorne apenas o texto da descrição.`;
          break;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      // Fix: Aligned with Gemini API guidelines to extract text directly from the `text` property.
      const text = response.text;
      setContentForm((prev) => ({ ...prev, [field]: text }));
    } catch (error) {
      console.error("Error generating content:", error);
      setGenerationError("Falha ao gerar conteúdo. Tente novamente.");
    } finally {
      setIsGenerating((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateHomeContent(contentForm);
      setContentMessage("Conteúdo da página inicial atualizado com sucesso!");
    } catch (err) {
      setContentMessage("Falha ao atualizar conteúdo.");
    }
    setTimeout(() => setContentMessage(""), 3000);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("As senhas não coincidem.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    const success = await updateAdminPassword(passwordForm.newPassword);
    if (success) {
      setPasswordMessage("Senha alterada com sucesso!");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } else {
      setPasswordMessage("Falha ao alterar senha.");
    }
    setTimeout(() => setPasswordMessage(""), 3000);
  };

  const AIGenerateButton: React.FC<{
    field: "title" | "subtitle" | "description";
  }> = ({ field }) => (
    <button
      type="button"
      onClick={() => handleGenerateContent(field)}
      disabled={isGenerating[field]}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-primary disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
      aria-label={`Gerar ${field} com IA`}
    >
      {isGenerating[field] ? (
        <svg
          className="animate-spin h-5 w-5 text-light-1"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <SparklesIcon className="w-5 h-5" />
      )}
    </button>
  );

  if (!homeContent) {
    return <p>Carregando configurações...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-primary mb-6">
        Configurações
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Home Page Content */}
        <div className="bg-dark-1 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Página Inicial com IA</h2>
          {generationError && (
            <p className="text-red-500 mb-4">{generationError}</p>
          )}
          <form onSubmit={handleContentSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-light-3 mb-1">
                Título
              </label>
              <input
                type="text"
                name="title"
                value={contentForm.title}
                onChange={handleContentChange}
                placeholder="Título"
                className="w-full bg-dark-3 p-3 pr-12 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
              />
              <AIGenerateButton field="title" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-light-3 mb-1">
                Subtítulo
              </label>
              <input
                type="text"
                name="subtitle"
                value={contentForm.subtitle}
                onChange={handleContentChange}
                placeholder="Subtítulo"
                className="w-full bg-dark-3 p-3 pr-12 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
              />
              <AIGenerateButton field="subtitle" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-light-3 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={contentForm.description}
                onChange={handleContentChange}
                placeholder="Descrição"
                rows={4}
                className="w-full bg-dark-3 p-3 pr-12 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
              />
              <AIGenerateButton field="description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-3 mb-1">
                Link do Botão (WhatsApp)
              </label>
              <input
                type="text"
                name="ctaButtonLink"
                value={contentForm.ctaButtonLink}
                onChange={handleContentChange}
                placeholder="Link do botão 'Fale Agora'"
                className="w-full bg-dark-3 p-3 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-primary text-dark-1 font-bold py-2 px-4 rounded-md hover:bg-brand-secondary"
            >
              Salvar Conteúdo
            </button>
            {contentMessage && (
              <p
                className={
                  contentMessage.includes("sucesso")
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {contentMessage}
              </p>
            )}
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-dark-1 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Alterar Senha</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-3 mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Nova Senha"
                className="w-full bg-dark-3 p-3 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-3 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirmar Nova Senha"
                className="w-full bg-dark-3 p-3 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-primary text-dark-1 font-bold py-2 px-4 rounded-md hover:bg-brand-secondary"
            >
              Alterar Senha
            </button>
            {passwordMessage && (
              <p
                className={
                  passwordMessage.includes("sucesso")
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {passwordMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
