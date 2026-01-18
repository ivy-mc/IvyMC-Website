import React from 'react';
import { useRouter } from 'next/router';

type PurchasesSupportAlertProps = {
    userEmail: string;
};

export default function PurchasesSupportAlert({ userEmail }: PurchasesSupportAlertProps) {
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
        <div className="bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-red-900/40 border-2 border-amber-500/70 rounded-xl p-6 mb-8 shadow-2xl animate__animated animate__pulse animate__slow animate__infinite">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="bg-amber-500/20 rounded-full p-3 animate__animated animate__bounce animate__infinite animate__slow">
                        <span className="material-symbols-rounded text-amber-300 text-5xl drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]">
                            warning
                        </span>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-amber-200 mb-3 drop-shadow-lg flex items-center gap-2">
                        <span className="animate__animated animate__flash animate__infinite animate__slow">⚠️</span>
                        Satın Alımınız Hesabınıza Gelmedi mi?
                    </h3>
                    
                    <div className="bg-dark-900/70 rounded-lg p-4 mb-4 border border-amber-500/30">
                        <p className="text-zinc-100 leading-relaxed">
                            <strong className="text-amber-300">{count}</strong> adet rank satın alımı tespit ettik ancak 
                            henüz hesabınıza tanımlanamadı.
                        </p>
                        <p className="text-zinc-300 text-sm mt-2">
                            Ödeme sırasında kullandığınız email: <strong className="text-orange-300">{memberships[0]?.supporter_email}</strong>
                        </p>
                        <p className="text-zinc-300 text-sm">
                            Hesap email'iniz: <strong className="text-green-300">{userEmail}</strong>
                        </p>
                    </div>

                    <div className="bg-dark-800/80 rounded-lg p-4 mb-4 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-rounded text-purple-400">
                                shopping_bag
                            </span>
                            <p className="text-purple-300 font-semibold">Bekleyen Satın Alımlar:</p>
                        </div>
                        <div className="space-y-2">
                            {memberships.map((m, i) => (
                                <div key={i} className="flex items-center justify-between bg-dark-700/50 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-rounded text-yellow-400 text-2xl">
                                            workspace_premium
                                        </span>
                                        <div>
                                            <p className="text-amber-200 font-semibold">{m.rank_name}</p>
                                            <p className="text-zinc-400 text-xs">
                                                {new Date(m.created_at).toLocaleDateString('tr-TR', { 
                                                    day: 'numeric', 
                                                    month: 'long', 
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-rounded text-orange-400 animate__animated animate__pulse animate__infinite">
                                        hourglass_empty
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 rounded-lg p-5 mb-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-rounded text-blue-400 text-3xl">
                                info
                            </span>
                            <div>
                                <h4 className="font-bold text-blue-300 mb-2">💡 Bu Sorunu Nasıl Çözebilirim?</h4>
                                <p className="text-zinc-200 text-sm leading-relaxed">
                                    Satın alımlarınızın hesabınıza tanımlanması için email adreslerinizin eşleşmesi gerekiyor. 
                                    Aşağıdaki çözümlerden birini kullanarak rank'lerinizi hemen alabilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="group bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-xl p-5 hover:border-green-400 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-green-500/20 rounded-full p-2">
                                    <span className="material-symbols-rounded text-green-400 text-3xl">
                                        mark_email_read
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-300 text-lg">Otomatik Çözüm</h4>
                                    <p className="text-green-400/70 text-xs">Önerilen yöntem</p>
                                </div>
                            </div>
                            <p className="text-zinc-200 text-sm mb-4 leading-relaxed">
                                Hesap email'inizi <strong className="text-amber-300">{memberships[0]?.supporter_email}</strong> 
                                olarak güncelleyin. Rank'leriniz <strong>otomatik</strong> ve <strong>anında</strong> hesabınıza tanımlanacak.
                            </p>
                            <button
                                onClick={() => router.push('/profil')}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105 shadow-lg"
                            >
                                <span className="material-symbols-rounded">
                                    edit
                                </span>
                                Email'imi Güncelle
                            </button>
                        </div>

                        <div className="group bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 rounded-xl p-5 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-500/20 rounded-full p-2">
                                    <span className="material-symbols-rounded text-blue-400 text-3xl">
                                        support_agent
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-300 text-lg">Destek Talebi</h4>
                                    <p className="text-blue-400/70 text-xs">Manuel işlem</p>
                                </div>
                            </div>
                            <p className="text-zinc-200 text-sm mb-4 leading-relaxed">
                                Discord sunucumuzdan <strong>destek talebi</strong> oluşturun. 
                                Yetkili ekibimiz rank'lerinizi <strong>manuel</strong> olarak tanımlayacak.
                            </p>
                            <a
                                href="https://discord.gg/ivymc"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2 group-hover:scale-105 shadow-lg"
                            >
                                <span className="material-symbols-rounded">
                                    open_in_new
                                </span>
                                Discord'a Git
                            </a>
                        </div>
                    </div>

                    <div className="mt-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3">
                        <p className="text-yellow-200 text-xs flex items-start gap-2">
                            <span className="material-symbols-rounded text-yellow-400 text-lg flex-shrink-0">
                                schedule
                            </span>
                            <span>
                                <strong>Not:</strong> Email güncellemesi yaparsanız rank'leriniz <strong>anında</strong> hesabınıza tanımlanır. 
                                Discord desteği ile işlem <strong>birkaç saat</strong> sürebilir.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
