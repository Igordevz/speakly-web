# Speakly: Transcrição de Áudio com IA

![Speakly Logo](public/globe.svg)

Bem-vindo ao Speakly, sua ferramenta inteligente para transformar áudios em texto com o poder da inteligência artificial. Organize, pesquise e interaja com suas transcrições de forma intuitiva e eficiente.

## ✨ Funcionalidades

- **Upload Simplificado**: Arraste e solte seus arquivos de áudio (MP3, WAV, M4A, OGG) para iniciar a transcrição.
- **Transcrições Precisas**: Converta áudios em texto com alta fidelidade, utilizando modelos avançados de IA.
- **Resumos Inteligentes**: Obtenha automaticamente os pontos-chave e resumos concisos de suas gravações.
- **Assistente de IA Interativo**: Faça perguntas específicas sobre o conteúdo do áudio e receba respostas instantâneas baseadas na transcrição.
- **Organização e Filtragem**: Visualize seus uploads com filtros por data (hoje, ontem, esta semana, este mês) e uma barra de pesquisa para encontrar rapidamente o que precisa.
- **Download de Transcrições**: Baixe suas transcrições em formato de texto para uso offline.
- **Interface Minimalista**: Design limpo e intuitivo, focado na experiência do usuário.

## 🚀 Tecnologias

- **Next.js**: Framework React para desenvolvimento web full-stack.
- **TypeScript**: Linguagem de programação para tipagem estática.
- **Tailwind CSS**: Framework CSS utilitário para estilização rápida e responsiva.
- **Shadcn/ui**: Componentes de UI reutilizáveis e acessíveis.
- **Axios**: Cliente HTTP para requisições à API.
- **Zod**: Validação de esquemas TypeScript-first.
- **Lucide React**: Biblioteca de ícones.
- **js-cookie**: Para manipulação de cookies.

## ⚙️ Configuração e Instalação

Para rodar o Speakly em sua máquina local, siga os passos abaixo:

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/speakly.git
    cd speakly/web
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    # ou yarn install
    # ou pnpm install
    # ou bun install
    ```

3.  **Configure as variáveis de ambiente**:
    Crie um arquivo `.env.local` na raiz do projeto (`/web`) e adicione as seguintes variáveis:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api # Substitua pela URL da sua API de backend
    ```

4.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    # ou yarn dev
    # ou pnpm dev
    # ou bun dev
    ```

    O aplicativo estará disponível em `http://localhost:3000`.

## 💡 Uso

Após iniciar o aplicativo:

1.  **Faça Login**: Utilize o sistema de Magic Link para acessar o dashboard.
2.  **Upload de Áudios**: Arraste e solte arquivos de áudio na área designada ou clique para selecionar.
3.  **Visualize e Interaja**: Explore suas transcrições, resumos e utilize o assistente de IA para fazer perguntas sobre o conteúdo dos áudios.
4.  **Organize**: Use a barra de pesquisa e os filtros de data para gerenciar seus arquivos.

## 📂 Estrutura do Projeto

```
web/
├── public/             # Ativos estáticos (imagens, ícones)
├── src/
│   ├── app/            # Rotas e páginas do Next.js
│   ├── components/     # Componentes React reutilizáveis (UI, Dashboard)
│   │   └── dashboard/  # Componentes específicos do dashboard (áudio, upload, etc.)
│   ├── context/        # Contextos React (autenticação)
│   ├── lib/            # Funções utilitárias e configurações (Axios)
│   └── types/          # Definições de tipos TypeScript
├── .env.local          # Variáveis de ambiente (não versionado)
├── next.config.ts      # Configuração do Next.js
├── package.json        # Dependências e scripts do projeto
└── tsconfig.json       # Configuração do TypeScript
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.# speakly-web
