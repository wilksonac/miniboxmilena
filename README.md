# DNIZ PDV & Estoque Mobile 📱🛒

Sistema completo de Controle de Estoque e Vendas (PDV) otimizado para celulares e pequenos comércios.

## 🚀 Funcionalidades

- **📱 Design Mobile-First**: Interface intuitiva, responsiva, com botões amplos e navegação inferior otimizada para polegares.
- **📦 Gestão de Produtos (Backend Admin)**: Cadastro completo, edição e exclusão de produtos com controle de estoque mínimo e categorias.
- **🛒 Frente de Caixa (Vendas/PDV)**: Busca instantânea por nome ou código de barras, controle de carrinho, seleção da forma de pagamento (Dinheiro, PIX, Cartão) e baixa automática no estoque.
- **📷 Leitor de Código de Barras Duplo**:
  - **Câmera do Celular**: Scanner nativo via câmera do smartphone com suporte a lanterna e foco rápido (EAN-13, CODE-128, etc.).
  - **Leitor Físico USB/Bluetooth**: Captura automática via emulação de teclado HID sem precisar apertar botões.
- **🔥 Firebase Firestore & Modo Offline**: Conexão com banco de dados em tempo real do Firebase Firestore + suporte a funcionamento local offline (LocalStorage) imediato.
- **📊 Histórico de Vendas**: Registro detalhado das vendas efetuadas e resumo financeiro do dia.

---

## 🛠️ Como Executar Localmente

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse no seu navegador em `http://localhost:5173`. Para testar no próprio celular na mesma rede Wi-Fi, execute:
   ```bash
   npx vite --host
   ```

3. **Gerar Versão de Produção**:
   ```bash
   npm run build
   ```

---

## 🌐 Como Enviar para o GitHub

1. Inicialize o repositório git no seu projeto:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sistema Mobile DNIZ PDV"
   ```

2. Crie um novo repositório no seu GitHub (ex: `dniz-pdv-mobile`) e conecte:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/dniz-pdv-mobile.git
   git push -u origin main
   ```

---

## ☁️ Como Configurar o Firebase (Opcional para Nuvem)

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e crie um novo projeto.
2. Crie um banco de dados **Firestore Database**.
3. Em *Configurações do Projeto* > *Seus Aplicativos*, selecione **Web (`</>`)** e copie o objeto de configuração.
4. Abra o aplicativo no celular/computador, vá na aba **Ajustes** > **Configurar Firebase Firestore** e cole as chaves.

---

## 📄 Licença
Desenvolvido para uso comercial no Portal DNIZ.
