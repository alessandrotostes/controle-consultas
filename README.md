# 🩺 Controle de Consultas e Gestão de Pacientes  
![License](https://img.shields.io/badge/license-MIT-green)  
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)  
![PRs](https://img.shields.io/badge/PRs-bem%20vindos-orange)  

Aplicação de **gestão e análise clínica** para profissionais da saúde, desenvolvida com foco em uma **interface intuitiva** e **funcionalidades robustas**.  
Permite o gerenciamento de **dados de pacientes**, **agendamento de consultas** e a **visualização de informações relevantes** para o acompanhamento clínico.  

---

## 🚀 Funcionalidades  

- 🔐 **Autenticação de Usuários**: sistema de login seguro para acesso restrito.  
- 👨‍⚕️ **Gestão de Pacientes**: cadastro, visualização e edição de informações detalhadas.  
- 📋 **Detalhes de Pacientes**: histórico de consultas, dados pessoais e outras informações relevantes.  
- 📱 **Interface Responsiva**: usabilidade em desktops, tablets e dispositivos móveis.  
- 📊 **Visualização de Dados**: gráficos e componentes organizados para análise rápida.  

---

## 🛠️ Tecnologias Utilizadas  

- **Next.js** → Framework React para SSR e SSG.  
- **React** → Construção de interfaces de usuário.  
- **TypeScript** → Tipagem estática para maior robustez.  
- **Tailwind CSS** → Estilização responsiva e ágil.  
- **Supabase** → Banco de dados (PostgreSQL), autenticação e APIs em tempo real.  
- **Heroicons** → Ícones SVG otimizados para interfaces.  
- **Recharts** → Gráficos interativos em React.  
- **date-fns** → Manipulação de datas em JavaScript.  

---

## 📂 Estrutura do Projeto  

```bash
controle-consultas-pacientes/
│
├── app/              # Rotas e páginas (auth, login, pacientes)
├── components/       # Componentes reutilizáveis (Header, Sidebar, AppContent)
├── lib/              # Tipos e bibliotecas auxiliares (types.ts)
├── public/           # Arquivos estáticos (imagens, ícones)
├── utils/            # Configurações e integração com Supabase
├── styles/           # Estilos globais
└── README.md         # Documentação do projeto
