-- Criar trigger para chamar handle_new_user quando um usuário é criado
-- Este trigger é essencial para criar o profile e role automaticamente

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Também criar trigger para quando email é confirmado (UPDATE)
-- Isso cobre o caso onde o usuário é criado sem email confirmado e depois confirma
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();