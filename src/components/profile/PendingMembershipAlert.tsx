import React from 'react';
import { useRouter } from 'next/router';

type PendingMembershipAlertProps = {
    userEmail: string;
};

export default function PendingMembershipAlert({ userEmail }: PendingMembershipAlertProps) {
    const [hasPending, setHasPending] = React.useState(false);
    const [count, setCount] = React.useState(0);
    const [memberships, setMemberships] = React.useState<Array<{
        rank_name: string;
        supporter_email: string;
        created_at: number;
    }>>([]);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    React.useEffect(() => {
        checkPendingMemberships();
    }, [userEmail]);

    const checkPendingMemberships = async () => {
        try {
            const response = await fetch(`/api/user/pending-memberships?email=${encodeURIComponent(userEmail)}`);
            if (response.ok) {
                const data = await response.json();
                setHasPending(data.has_pending);
                setCount(data.count);
                setMemberships(data.memberships || []);
            }
        } catch (error) {
            console.error('Failed to check pending memberships:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !hasPending) {
        return null;
    }

    return (
        <div className="bg-amber-900/30 border-2 border-amber-500 rounded-lg p-6 mb-6 animate__animated animate__fadeIn">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <span className="material-symbols-rounded text-amber-400 text-4xl">
                        notifications_active
                    </span>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-300 mb-2">
                        🎉 Bekleyen Membership Satın Alımınız Var!
                    </h3>
                    <p className="text-zinc-200 mb-4">
                        BuyMeACoffee'den <strong>{count}</strong> adet rank satın aldınız ancak 
                        ödeme sırasında kullandığınız email adresi <strong className="text-amber-300">{memberships[0]?.supporter_email}</strong> 
                        ile websitemizdeki hesap email'iniz <strong className="text-amber-300">{userEmail}</strong> eşleşmiyor.
                    </p>

                    <div className="bg-dark-800 rounded-lg p-4 mb-4">
                        <p className="text-zinc-300 font-semibold mb-2">Satın Aldığınız Rank(lar):</p>
                        <ul className="list-disc list-inside space-y-1">
                            {memberships.map((m, i) => (
                                <li key={i} className="text-amber-200">
                                    {m.rank_name} 
                                    <span className="text-zinc-400 text-sm ml-2">
                                        ({new Date(m.created_at).toLocaleDateString('tr-TR')})
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <p className="text-zinc-300 font-semibold">
                            Rank'lerinizi almak için aşağıdaki seçeneklerden birini kullanın:
                        </p>

                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-rounded text-green-400">
                                        mail
                                    </span>
                                    <h4 className="font-semibold text-green-300">Seçenek 1: Email Güncelle</h4>
                                </div>
                                <p className="text-zinc-300 text-sm mb-3">
                                    Websitedeki hesap email'inizi <strong>{memberships[0]?.supporter_email}</strong> 
                                    olarak güncelleyin. Rank'ler otomatik olarak hesabınıza tanımlanacak.
                                </p>
                                <button
                                    onClick={() => router.push('/profil')}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Email'imi Güncelle
                                </button>
                            </div>

                            <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-rounded text-blue-400">
                                        support_agent
                                    </span>
                                    <h4 className="font-semibold text-blue-300">Seçenek 2: Destek Talebi</h4>
                                </div>
                                <p className="text-zinc-300 text-sm mb-3">
                                    Discord sunucumuzdan destek talebi oluşturun. 
                                    Yetkili ekibimiz rank'lerinizi manuel olarak tanımlayacak.
                                </p>
                                <a
                                    href="https://discord.gg/ivymc"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
                                >
                                    Discord'a Git
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
