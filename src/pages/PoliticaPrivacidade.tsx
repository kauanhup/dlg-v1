import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import SEO from "@/components/SEO";

const PoliticaPrivacidade = () => {
  return (
    <>
      <SEO
        title="Política de Privacidade"
        description="Política de Privacidade da DLG Connect. Saiba como coletamos, usamos e protegemos seus dados pessoais conforme a LGPD."
        canonical="/politica-privacidade"
      />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-display font-bold">Política de Privacidade</h1>
            </div>

            <p className="text-muted-foreground mb-8">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">1. Introdução</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A DLG Connect ("nós", "nosso" ou "empresa") está comprometida em proteger sua privacidade. 
                  Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas 
                  informações pessoais quando você utiliza nossos serviços, em conformidade com a Lei Geral 
                  de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">2. Dados que Coletamos</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">Coletamos os seguintes tipos de dados:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone/WhatsApp</li>
                  <li><strong>Dados de pagamento:</strong> informações necessárias para processar transações</li>
                  <li><strong>Dados de uso:</strong> logs de acesso, endereço IP, navegador utilizado</li>
                  <li><strong>Dados de sessão:</strong> cookies e identificadores de sessão</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">3. Finalidade do Tratamento</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">Utilizamos seus dados para:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Fornecer e manter nossos serviços</li>
                  <li>Processar pagamentos e gerenciar assinaturas</li>
                  <li>Enviar comunicações importantes sobre sua conta</li>
                  <li>Melhorar nossos serviços e experiência do usuário</li>
                  <li>Cumprir obrigações legais</li>
                  <li>Prevenir fraudes e garantir segurança</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">4. Base Legal (LGPD)</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O tratamento de dados pessoais é realizado com base nas seguintes hipóteses legais 
                  previstas na LGPD: consentimento do titular, execução de contrato, cumprimento de 
                  obrigação legal, legítimo interesse e proteção do crédito.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">5. Compartilhamento de Dados</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Seus dados podem ser compartilhados com:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Processadores de pagamento:</strong> para efetuar transações financeiras</li>
                  <li><strong>Provedores de infraestrutura:</strong> serviços de hospedagem e banco de dados</li>
                  <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Não vendemos ou alugamos seus dados pessoais a terceiros.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">6. Seus Direitos (LGPD)</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Conforme a LGPD, você tem direito a:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Confirmar a existência de tratamento de dados</li>
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou desatualizados</li>
                  <li>Solicitar anonimização, bloqueio ou eliminação de dados</li>
                  <li>Solicitar portabilidade dos dados</li>
                  <li>Revogar consentimento a qualquer momento</li>
                  <li>Obter informações sobre compartilhamento de dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento do site e cookies de análise 
                  para melhorar nossos serviços. Você pode gerenciar suas preferências de cookies 
                  através das configurações do seu navegador.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">8. Segurança dos Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas técnicas e organizacionais apropriadas para proteger seus 
                  dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição, 
                  incluindo criptografia, controle de acesso e monitoramento de segurança.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">9. Retenção de Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades 
                  descritas nesta política, ou conforme exigido por lei. Após esse período, os 
                  dados serão eliminados ou anonimizados.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">10. Contato</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em 
                  contato conosco através do WhatsApp:{" "}
                  <a 
                    href="https://wa.me/5565996498222" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    (65) 99649-8222
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-3">11. Alterações</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
                  sobre mudanças significativas através do e-mail cadastrado ou aviso em nosso site.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PoliticaPrivacidade;
