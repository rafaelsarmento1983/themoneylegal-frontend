import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Building2, Users as UsersIcon, User } from 'lucide-react';
import { useCreateTenant } from '@/hooks/mutations';

// Schema de validação
const createTenantSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  type: z.enum(['PERSONAL', 'FAMILY', 'BUSINESS']),
  plan: z.enum(['FREE', 'PREMIUM']),
});

type CreateTenantFormData = z.infer<typeof createTenantSchema>;

export function NewTenantPage() {
  const navigate = useNavigate();
  const createTenantMutation = useCreateTenant();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      type: 'PERSONAL',
      plan: 'FREE',
    },
  });

  const selectedType = watch('type');
  const selectedPlan = watch('plan');

  const onSubmit = (data: CreateTenantFormData) => {
    createTenantMutation.mutate({
      name: data.name,
      type: data.type,
      plan: data.plan,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Criar Novo Workspace
            </h1>
            <p className="text-gray-600">
              Comece do zero e convide sua equipe ou família
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome do Workspace */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Workspace
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Ex: Família Silva, Empresa XYZ"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Pessoal */}
                <label className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                  selectedType === 'PERSONAL'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    {...register('type')}
                    value="PERSONAL"
                    className="sr-only"
                  />
                  <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium text-gray-900">Pessoal</div>
                </label>

                {/* Familiar */}
                <label className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                  selectedType === 'FAMILY'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    {...register('type')}
                    value="FAMILY"
                    className="sr-only"
                  />
                  <UsersIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium text-gray-900">Familiar</div>
                </label>

                {/* Empresarial */}
                <label className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                  selectedType === 'BUSINESS'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    {...register('type')}
                    value="BUSINESS"
                    className="sr-only"
                  />
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium text-gray-900">Empresarial</div>
                </label>
              </div>
            </div>

            {/* Plano */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Plano
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Free */}
                <label className={`cursor-pointer border-2 rounded-lg p-6 transition-all ${
                  selectedPlan === 'FREE'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    {...register('plan')}
                    value="FREE"
                    className="sr-only"
                  />
                  <div className="font-bold text-lg text-gray-900 mb-1">Free</div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">R$ 0/mês</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Até 3 membros</li>
                    <li>Recursos básicos</li>
                  </ul>
                </label>

                {/* Premium */}
                <label className={`cursor-pointer border-2 rounded-lg p-6 transition-all ${
                  selectedPlan === 'PREMIUM'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    {...register('plan')}
                    value="PREMIUM"
                    className="sr-only"
                  />
                  <div className="font-bold text-lg text-gray-900 mb-1">Premium</div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">R$ 29/mês</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Membros ilimitados</li>
                    <li>IA avançada</li>
                  </ul>
                </label>
              </div>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={createTenantMutation.isPending}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg disabled:opacity-50"
            >
              {createTenantMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando...
                </span>
              ) : (
                'Criar Workspace'
              )}
            </button>
          </form>
        </div>

        {/* Link para voltar */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Voltar ao Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
