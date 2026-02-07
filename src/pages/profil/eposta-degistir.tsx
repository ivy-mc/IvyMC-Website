import AuthManager, { User } from '@/lib/server/auth/AuthManager'
import { PageProps } from '@/types'
import { GetServerSideProps } from 'next'
import React from 'react'
import "@/styles/blog.module.scss"
import Layout from '@/layouts/Layout'
import Util from '@/lib/common/Util'
import Input from '@/components/register/Input'
import axios from 'axios'

ProfilePage.getLayout = function getLayout(page: React.ReactNode, pageProps: any) {
    return (
        <Layout profile
            user={pageProps.user}
            title="IvyMC - Profil"
            description="IvyMC sunucusundaki profilinizi yönetin."
            ogDescription="IvyMC sunucusundaki profilinizi yönetin."
        >
            {page}
        </Layout>
    )
}

export default function ProfilePage({ user }: PageProps) {
    if (!user) return null;

    const [submitting, setSubmitting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');
    const [showPinInput, setShowPinInput] = React.useState(false);
    const [pendingEmail, setPendingEmail] = React.useState('');
    const [pendingPassword, setPendingPassword] = React.useState('');

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) {
            return;
        }

        let password: string;
        let newEmail: string;
        let newEmailAgain: string;
        let pin: string | undefined;

        if (!showPinInput) {
            // İlk aşama: Form'dan değerleri al
            const passwordInput = e.currentTarget.elements.namedItem('password') as HTMLInputElement;
            const newEmailInput = e.currentTarget.elements.namedItem('new-email') as HTMLInputElement;
            const newEmailAgainInput = e.currentTarget.elements.namedItem('new-email-again') as HTMLInputElement;
            
            password = passwordInput?.value || '';
            newEmail = newEmailInput?.value || '';
            newEmailAgain = newEmailAgainInput?.value || '';

            // İlk aşama: E-posta ve şifre kontrolü
            if (!password || !newEmail || !newEmailAgain) {
                setErrorMessage('Tüm alanları doldurun.');
                return;
            }

            if (newEmail !== newEmailAgain) {
                setErrorMessage('E-posta adresleri uyuşmuyor.');
                return;
            }
        } else {
            // İkinci aşama: Pending değerlerini kullan ve PIN'i al
            password = pendingPassword;
            newEmail = pendingEmail;
            newEmailAgain = pendingEmail;
            
            const pinInput = e.currentTarget.elements.namedItem('pin') as HTMLInputElement;
            pin = pinInput?.value || '';
            
            // İkinci aşama: PIN doğrulama
            if (!pin) {
                setErrorMessage('Doğrulama kodunu girin.');
                return;
            }
        }

        setSubmitting(true);

        try {
            const response = await axios.post('/api/auth/change-email', {
                password: showPinInput ? pendingPassword : password,
                newEmail: showPinInput ? pendingEmail : newEmail,
                pin
            });

            if (response.data.requiresPin) {
                // PIN gerekiyor, PIN input'unu göster
                setPendingEmail(newEmail);
                setPendingPassword(password);
                setErrorMessage('');
                setSuccessMessage(response.data.name);
                setSubmitting(false);
                setShowPinInput(true);
            } else {
                // Başarılı
                setErrorMessage('');
                setShowPinInput(false);
                setSubmitting(false);
                setSuccessMessage(response.data.name);
                
                // 2 saniye sonra sayfayı yenile
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            setErrorMessage((error as any).response?.data?.name || 'Bir hata oluştu');
            setSubmitting(false);
        }

        setTimeout(() => {
            if (!showPinInput) {
                setSuccessMessage('');
            }
            setErrorMessage('');
        }, 5000);
    }

    return (
        <div data-aos="fade">
            <div className='flex items-start justify-between md:flex-col-reverse md:gap-6'>
                <h2 className='text-3xl md:text-2xl font-semibold text-white'>E-posta Değiştir</h2>
                <span className={
                    `text-base font-semibold text-white inline-block px-3 py-2 rounded-md`}
                    style={{ backgroundColor: Util.getRankColor(user.player.rank) }}
                >
                    Rütbeniz: {Util.getRankDisplayName(user.player.rank)}
                </span>
            </div>
            {!errorMessage && !successMessage && <p className='text-zinc-300 mt-2'>
                Buradan e-posta adresinizi değiştirebilirsiniz.
            </p>}
            {errorMessage && <p className='text-red-500 mt-2'>{errorMessage}</p>}
            {successMessage && <p className='text-green-500 mt-2'>{successMessage}</p>}
            <div>
                <div className='mt-4 p-4 bg-dark-750 rounded-md'>
                    <p className='text-zinc-300 text-sm'>
                        <strong className='text-white'>Mevcut E-posta:</strong> {user.email}
                    </p>
                </div>
                <form className='mt-6' onSubmit={onSubmit} key={showPinInput ? 'pin-form' : 'email-form'}>
                    {!showPinInput ? (
                        <>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='password' className='text-zinc-300'>Şifreniz</label>
                                <Input
                                    type='password'
                                    id='password'
                                    className='!bg-dark-750 p-2 rounded-md text-zinc-300 hover:bg-dark-650'
                                    placeholder='Şifrenizi girin'
                                    disabled={submitting}
                                />
                            </div>
                            <div className='flex flex-col gap-2 mt-4'>
                                <label htmlFor='new-email' className='text-zinc-300'>Yeni E-posta</label>
                                <Input
                                    type='email'
                                    id='new-email'
                                    className='!bg-dark-750 p-2 rounded-md text-zinc-300 hover:bg-dark-650'
                                    placeholder='Yeni e-posta adresinizi girin'
                                    disabled={submitting}
                                />
                            </div>
                            <div className='flex flex-col gap-2 mt-4'>
                                <label htmlFor='new-email-again' className='text-zinc-300'>Yeni E-posta Tekrar</label>
                                <Input
                                    type='email'
                                    id='new-email-again'
                                    className='!bg-dark-750 p-2 rounded-md text-zinc-300 hover:bg-dark-650'
                                    placeholder='Yeni e-posta adresinizi tekrar girin'
                                    disabled={submitting}
                                />
                            </div>
                            <input
                                type='submit'
                                value={submitting ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                                className='mt-6 w-full p-3 bg-green-500 text-zinc-200 rounded-lg hover:bg-green-400 duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                disabled={submitting}
                            />
                        </>
                    ) : (
                        <>
                            <div className='p-4 bg-blue-500/10 border border-blue-500/30 rounded-md mb-4'>
                                <p className='text-blue-400 text-sm'>
                                    <strong>{pendingEmail}</strong> adresine doğrulama kodu gönderildi. 
                                    Lütfen e-postanızı kontrol edin ve 6 haneli kodu aşağıya girin.
                                </p>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <label htmlFor='pin' className='text-zinc-300'>Doğrulama Kodu (6 Haneli)</label>
                                <Input
                                    type='text'
                                    id='pin'
                                    maxLength={6}
                                    className='!bg-dark-750 p-2 rounded-md text-zinc-300 hover:bg-dark-650 text-center text-2xl tracking-widest'
                                    placeholder='000000'
                                    disabled={submitting}
                                    autoFocus
                                />
                            </div>
                            <div className='flex gap-3 mt-6'>
                                <button
                                    type='button'
                                    onClick={() => {
                                        setShowPinInput(false);
                                        setPendingEmail('');
                                        setPendingPassword('');
                                        setSuccessMessage('');
                                        setErrorMessage('');
                                    }}
                                    className='w-1/3 p-3 bg-gray-600 text-zinc-200 rounded-lg hover:bg-gray-500 duration-300 cursor-pointer'
                                >
                                    İptal
                                </button>
                                <input
                                    type='submit'
                                    value={submitting ? 'Doğrulanıyor...' : 'E-postayı Değiştir'}
                                    className='w-2/3 p-3 bg-green-500 text-zinc-200 rounded-lg hover:bg-green-400 duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                    disabled={submitting}
                                />
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}


export const getServerSideProps = (async (ctx) => {
    const user = await AuthManager.getInstance().getUserFromContext(ctx);
    if (!user) {
        return {
            redirect: {
                destination: "/giris-yap",
                permanent: false
            }
        }
    }
    return {
        props: {
            user
        }
    }
}) satisfies GetServerSideProps<{ user: User | null }>
