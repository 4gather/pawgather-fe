import { z } from 'zod';

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'email을 입력해 주세요')
    .max(100, 'email은 100자 이하로 입력해주세요')
    .pipe(z.email('email 형식을 지켜주세요')),
});

export const nicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, 'nickname은 3자 이상 입력해주세요')
    .max(20, 'nickname은 20자 이하로 입력해주세요')
    .regex(
      /^[a-zA-Z0-9\uAC00-\uD7A3_]+$/u,
      'nickname은 영문, 숫자, 한글, 언더바(_)만 사용할 수 있습니다'
    ),
});

export const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'email을 입력해 주세요')
      .pipe(z.email('email 형식을 지켜주세요')),
    nickname: z
      .string()
      .trim()
      .min(3, 'nickname은 3자 이상 입력해주세요')
      .max(20, 'nickname은 20자 이하로 입력해주세요')
      .regex(
        /^[a-zA-Z0-9\uAC00-\uD7A3_]+$/u,
        'nickname은 영문, 숫자, 한글, 언더바(_)만 사용할 수 있습니다'
      ),
    password: z
      .string()
      .trim()
      .min(8, 'password는 8자 이상 입력해주세요')
      .max(50, 'password는 50자 이하로 입력해주세요')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^*()_+=.~])[a-zA-Z\d!@#$%^*()_+=.~]+$/,
        'password는 영문, 숫자, 특수문자(!@#$%^*()_+=.~)를 각각 최소 1개 이상 포함해야 합니다'
      ),
    confirmPassword: z.string().trim().min(1, '비밀번호 확인을 입력해 주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'email을 입력해 주세요')
    .pipe(z.email('email 형식을 지켜주세요')),
  password: z.string().trim().min(1, 'password를 입력해 주세요'),
});

export type EmailFormData = z.infer<typeof emailSchema>;
export type NicknameFormData = z.infer<typeof nicknameSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
