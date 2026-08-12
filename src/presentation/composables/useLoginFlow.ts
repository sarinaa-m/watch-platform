import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@infra/state/authState';
import { useRequestOtpMutation, useVerifyOtpMutation } from '@application/usecases/authUseCases';

export function useLoginFlow() {
  const auth = useAuth();
  const router = useRouter();
  const route = useRoute();

  const { mutate: requestOtpMutation, isPending, error: requestOtpError } = useRequestOtpMutation();

  const {
    mutate: verifyOtpMutation,
    isPending: verifyOtpPending,
    error: verifyOtpError,
  } = useVerifyOtpMutation();

  const step = ref<'identifier' | 'otp'>('identifier');
  const identifier = ref('');
  const otp = ref('');
  const loading = computed(() => isPending.value || verifyOtpPending.value);

  function submitIdentifier(): void {
    requestOtpMutation(identifier.value, {
      onSuccess: () => {
        step.value = 'otp';
      },
    });
  }

  function submitOtp(): void {
    verifyOtpMutation(
      {
        identifier: identifier.value,
        otp: otp.value,
      },
      {
        onSuccess: (data) => {
          auth.setSession(data);
          const redirect = route.query.redirect;
          router.push(typeof redirect === 'string' ? redirect : { name: 'home' });
        },
      }
    );
  }

  function backToIdentifier(): void {
    step.value = 'identifier';
    otp.value = '';
  }

  return {
    step,
    identifier,
    otp,
    loading,
    requestOtpError,
    verifyOtpError,
    submitIdentifier,
    submitOtp,
    backToIdentifier,
  };
}
