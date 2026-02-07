import Input from '@/components/register/Input';
import Layout from '@/layouts/Layout'
import Util from '@/lib/common/Util';
import { User } from '@/lib/server/auth/AuthManager';
import AuthManager from '@/lib/server/auth/AuthManager';
import { PageProps } from '@/types';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router'
import React from 'react'
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

ResetPasswordPage.getLayout = function getLayout(page: React.ReactNode, pageProps: PageProps) {
    return (
        <Layout
            title="IvyMC - Şifre Sıfırla"
            description="IvyMC sunucusundaki şifrenizi sıfırlayın."
            ogDescription="IvyMC sunucusundaki şifrenizi sıfırlayın."
            user={pageProps.user}
        >
            {page}
        </Layout>
    )
}

export default function ResetPasswordPage(props: PageProps) {
    const router = useRouter();
    const turnstileRef = React.useRef<TurnstileInstance>(null);

    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const [successMessage, setSuccessMessage] = React.useState<string>('');
    const [turnstileToken, setTurnstileToken] = React.useState<string>('');
    const [submitting, setSubmitting] = React.useState<boolean>(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (submitting) {
            return;
        }

        const token = turnstileToken;
        if (!token) {
            setErrorMessage('Lütfen Turnstile doğrulamasını yapın.');
            return;
        }

        turnstileRef.current?.reset();
        setTurnstileToken('');
        const email = (e.currentTarget.querySelector('#email') as HTMLInputElement).value;

        if (!Util.isValidEmail(email)) {
            setErrorMessage('Geçersiz e-posta adresi.');
            return;
        }
        setSubmitting(true);


        try {
            await axios.post('/api/auth/reset-password', {
                email,
                captcha: token
            });

            setErrorMessage('');
            setSuccessMessage('Şifre sıfırlama maili gönderildi.');
            setSubmitting(false);
        } catch (error) {
            setErrorMessage((error as any).response.data.name);
            setSubmitting(false);
        }
    }

    return (
        <>
            <div className='w-full flex justify-between items-center mt-36 md:mt-20 sm:mt-12 mb-36 md:mb-20 sm:mb-12 gap-28 md:gap-10 flex-wrap md:justify-center' data-aos="fade-down">
                <div className='flex-[5_0_0%] flex justify-end items-end min-w-[23rem] md:min-w-0 md:justify-center md:w-full'>
                    <Image
                        className='max-w-full h-auto'
                        src="/assets/auth/wizard.png"
                        alt="Register Image"
                        placeholder='blur'
                        blurDataURL='/uploads/thumbnail_wizard_90f703e5a7.png'
                        width={480}
                        height={480}
                    />
                </div>
                <div className='flex-[9_0_0%]' >
                    <h1 className='text-4xl md:text-3xl font-semibold'>Şifreni Sıfırla</h1>
                    {
                        submitting &&
                        <p className='text-zinc-400 mt-4'>İşlem yapılıyor...</p>
                    }
                    {!errorMessage && !submitting && !successMessage && <p className='text-zinc-400 mt-4'>
                        Şifrenizi sıfırlamak için lütfen mail adresinizi girin.
                    </p>}
                    {
                        errorMessage && !successMessage && !submitting &&
                        <p className='text-red-500 mt-4'>{errorMessage}</p>
                    }
                    {
                        successMessage && !errorMessage && !submitting &&
                        <p className='text-green-500 mt-4'>{successMessage}</p>
                    }
                    <form className='mt-4 flex flex-col gap-4' onSubmit={onSubmit}>
                        <Input
                            id='email'
                            type="email"
                            placeholder="E-Posta Adresi"
                        />
                        <Turnstile
                            ref={turnstileRef}
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                            onSuccess={(token) => setTurnstileToken(token)}
                            options={{
                                theme: 'dark',
                            }}
                            className='mt-2'
                        />
                        <button
                            type="submit"
                            className='p-4 bg-purple-500 text-zinc-200 rounded-lg hover:bg-purple-400 duration-300'
                        >
                            Şifremi Sıfırla
                        </button>
                    </form>
                    <div className='mt-6'>
                        <span className='text-zinc-400'>Hesabın yok mu?</span>
                        <Link
                            href={'/kaydol'}
                            className='ml-2 text-purple-400 hover:text-purple-300'
                        >
                            Kaydol
                        </Link>
                    </div>

                </div>
            </div>
        </>
    )
}

export const getServerSideProps = (async (ctx) => {
    return {
        props: {
            user: await AuthManager.getInstance().getUserFromContext(ctx)
        }
    }
}) satisfies GetServerSideProps<{ user: User | null }>
