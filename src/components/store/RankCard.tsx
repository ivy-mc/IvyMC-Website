import React from "react"
import Image from "next/image"
import Button from "../common/Button"
import 'animate.css';
import Util from "@/lib/common/Util";
import PopUp from "../common/PopUp";
import { User } from "@/lib/server/auth/AuthManager";
import { useRouter } from "next/router";

export default function RankCard(props: {
    user?: User;
    title: string;
    price: number;
    priceEur?: number;
    credit_market_id: string;
    discount?: {
        percentage: number;
        end_date: string | Date;
    };
    icon: string;
    privileges?: {
        rank: string;
        color: string;
        groups: {
            title: string;
            privileges: {
                icon_id: string;
                text: string;
            }[];
        }[];
    };
}) {
    const [showPopup, setShowPopup] = React.useState(false);
    const [purchasing, setPurchasing] = React.useState<'balance' | 'card' | null>(null);
    const [priceInTRY, setPriceInTRY] = React.useState<number>(0);
    const [priceEurFormatted, setPriceEurFormatted] = React.useState<string>('');
    const coinRef = React.useRef<HTMLTemplateElement>(null);
    const coinRef2 = React.useRef<HTMLTemplateElement>(null);

    // EUR → TRY dönüştürme (API'den real-time kur çek)
    React.useEffect(() => {
        // Test: props kontrol et
        console.log(`[RankCard] Props:`, {
            title: props.title,
            priceEur: props.priceEur,
            credit_market_id: props.credit_market_id
        });

        // Eğer priceEur undefined ise, title'dan guesstimate yap (debug için)
        let eurPrice = props.priceEur;
        if (!eurPrice || eurPrice <= 0) {
            if (props.credit_market_id === 'cirak') eurPrice = 5;
            else if (props.credit_market_id === 'asil') eurPrice = 10;
            else if (props.credit_market_id === 'soylu') eurPrice = 20;
            else if (props.credit_market_id === 'senyor') eurPrice = 40;
        }

        if (eurPrice && eurPrice > 0) {
            // API'den real-time fiyat al
            fetch(`/api/utils/convert-eur-to-try?amount=${eurPrice}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.roundedTryAmount > 0) {
                        setPriceInTRY(data.roundedTryAmount);
                        setPriceEurFormatted(`${eurPrice}€`);
                        console.log(`[RankCard ${props.title}] EUR: ${eurPrice}€ → TRY: ${data.roundedTryAmount}₺ (Kur: ${data.exchangeRate}, Cached: ${data.isCached})`);
                    }
                })
                .catch(err => {
                    console.error('[RankCard] API error:', err);
                    // Fallback: lokal hesaplama (51.4 TL/EUR)
                    const fallbackTRY = Math.round((eurPrice * 51.4) / 5) * 5;
                    setPriceInTRY(fallbackTRY);
                    setPriceEurFormatted(`${eurPrice}€`);
                });
        }
    }, [props.priceEur, props.credit_market_id, props.title]);

    let discount = props.discount;
    if (discount) {
        const end_date = new Date(discount.end_date);
        const now = new Date();
        if (end_date < now) {
            discount = undefined;
        }
    }

    
    const _price = Math.floor(props.price * 100 / (100 - (props.discount?.percentage || 0)));
    const price = props.price;

    // Rütbe renklerini tanımla
    const rankColors: Record<string, { border: string; shadow: string; text: string; gradient: string; borderHex: string; popupShadow: string; }> = {
        'cirak': {
            border: 'hover:border-gray-500/50',
            shadow: 'hover:shadow-[0_0_20px_rgba(107,114,128,0.3)]',
            text: 'text-gray-400',
            gradient: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
            borderHex: '#6b7280',
            popupShadow: '0 0 20px rgba(107,114,128, 0.5), 0 0 40px rgba(107,114,128, 0.3), 0 0 60px rgba(107,114,128, 0.1)'
        },
        'asil': {
            border: 'hover:border-orange-500/50',
            shadow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
            text: 'text-orange-400',
            gradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
            borderHex: '#f97316',
            popupShadow: '0 0 20px rgba(249,115,22, 0.5), 0 0 40px rgba(249,115,22, 0.3), 0 0 60px rgba(249,115,22, 0.1)'
        },
        'soylu': {
            border: 'hover:border-yellow-500/50',
            shadow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
            text: 'text-yellow-400',
            gradient: 'linear-gradient(135deg, #713f12 0%, #854d0e 100%)',
            borderHex: '#eab308',
            popupShadow: '0 0 20px rgba(234,179,8, 0.5), 0 0 40px rgba(234,179,8, 0.3), 0 0 60px rgba(234,179,8, 0.1)'
        },
        'senyor': {
            border: 'hover:border-purple-500/50',
            shadow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
            text: 'text-purple-400',
            gradient: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
            borderHex: '#a855f7',
            popupShadow: '0 0 20px rgba(168,85,247, 0.5), 0 0 40px rgba(168,85,247, 0.3), 0 0 60px rgba(168,85,247, 0.1)'
        }
    };

    const currentRankColor = rankColors[props.credit_market_id] || {
        border: 'hover:border-green-500/50',
        shadow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        text: 'text-green-400',
        gradient: 'linear-gradient(135deg, #1a4d2e 0%, #1e5a35 100%)',
        borderHex: '#2ecc71',
        popupShadow: '0 0 20px rgba(46, 204, 113, 0.5), 0 0 40px rgba(46, 204, 113, 0.3), 0 0 60px rgba(46, 204, 113, 0.1)'
    };

    const popupRankColor = {
        border: currentRankColor.borderHex,
        shadow: currentRankColor.popupShadow,
        gradient: currentRankColor.gradient
    };

    const buttonId = Util.slugify(props.title) + "_buy";

    // @ts-ignore
    const lottie = <lottie-player
        id="upgrade_crown"
        ref={coinRef}
        speed={1}
        loop={true}
        mode="normal"
        autoplay={true}
        style={{ pointerEvents: 'none' }}
        src="/assets/animations/diamond.json"
    />

    // @ts-ignore
    const lottie2 = <lottie-player
        id="upgrade_crown"
        ref={coinRef2}
        speed={1}
        loop={true}
        mode="normal"
        autoplay={true}
        style={{ pointerEvents: 'none' }}
        src="/assets/animations/diamond.json"
    />

    const [randomId, setRandomId] = React.useState<string>("");
    const iconId = "rank_card_" + randomId;
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [alreadyHasARank, setAlreadyHasARank] = React.useState<boolean>(false);
    const [balanceError, setBalanceError] = React.useState<boolean>(false);

    const router = useRouter();

    // Random ID'yi client-side oluştur (hydration error'ı önlemek için)
    React.useEffect(() => {
        setRandomId(Math.random().toString(36).substring(7));
    }, []);

    // Icon hover animasyonu
    const handleCardMouseEnter = () => {
        const icon = document.getElementById(iconId);
        icon?.classList.add("animate__flip", "animate__animated");
    };

    const handleCardMouseLeave = () => {
        const icon = document.getElementById(iconId);
        icon?.classList.remove("animate__flip", "animate__animated");
    };

    return (
        <>
            <PopUp
                show={showPopup}
                title={props.title}
                onClose={() => setShowPopup(false)}
                rankColor={popupRankColor}
                footer={
                    alreadyHasARank ? <Button
                        type="button"
                        onClick={() => {
                            setShowPopup(false);
                            setAlreadyHasARank(false);
                            window.open("/destek", "_blank");
                        }}
                        className="bg-blue-500 hover:bg-blue-400 w-fit"
                    >
                        Destek Ekibine Ulaş
                    </Button> :
                        successMessage ? <Button
                            type="button"
                            onClick={() => {
                                setShowPopup(false);
                                setSuccessMessage(null);
                                router.replace("/magaza/rutbeler", undefined, { shallow: false });
                            }}
                            className="bg-green-500 hover:bg-green-400 w-fit"
                        >
                            Tamam
                        </Button>
                            :
                            errorMessage ? <Button
                                type="button"
                                onClick={() => {
                                    setShowPopup(false);
                                    setErrorMessage(null);
                                    router.push("/magaza/rutbeler");
                                }}
                                className="bg-red-500 hover:bg-red-400 w-fit"
                            >
                                Tamam
                            </Button>
                                :
                                !props.user ?
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setShowPopup(false);
                                            router.push("/giris-yap");
                                        }}
                                        className="bg-blue-500 hover:bg-blue-400 w-fit"
                                    >
                                        Giriş Yap
                                    </Button>
                                : undefined
                }
            >
                <div className="flex flex-col gap-0 w-full">
                    {props.privileges && props.privileges.groups && (
                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[45vh] pr-2">
                            {props.privileges.groups.map((group, groupIndex) => (
                                <div key={groupIndex} className='flex flex-col gap-3'>
                                    <h4 className='text-lg font-semibold text-zinc-300'>
                                        {group.title}
                                    </h4>
                                    <div className='flex flex-col gap-2'>
                                        {group.privileges.map((privilege, privIndex) => (
                                            <div key={privIndex} className='flex items-center gap-2'>
                                                <span className='material-symbols-rounded text-zinc-400 text-xl'>
                                                    {privilege.icon_id}
                                                </span>
                                                <span className='text-zinc-200'>
                                                    {privilege.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col gap-2 w-full flex-shrink-0 pt-4 border-t border-zinc-600/30">
                        {
                            alreadyHasARank ?
                                <div className="text-zinc-200 rounded-lg max-w-[28rem] md:max-w-full text-center text-lg md:text-base">
                                    Zaten bir rütbe sahibisiniz! Eğer bunu değiştirmek
                                    istiyorsanız destek ekibimizle iletişime geçebilirsiniz.
                                </div>
                                :
                                successMessage ?
                                    <div className="bg-green-500 text-white p-2 rounded-lg">
                                        {successMessage}
                                    </div>
                                    :
                                    errorMessage ?
                                        <div className="bg-red-500 text-white p-2 rounded-lg">
                                            {errorMessage}
                                        </div>
                                        :
                                        props.user ? 
                                        <div className="flex flex-col gap-3 items-center">
                                            <p className="text-base text-zinc-200 text-center">
                                                Bir ödeme yöntemi seçin:
                                            </p>

                                            {/* İki sütunlu buton layout */}
                                            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 w-full">
                                                {/* Bakiye ile satın alma */}
                                                <div className="flex flex-col">
                                                    <Button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (purchasing) return;
                                                            setPurchasing('balance');
                                                            const response = await fetch("/api/store/purchase/rank/" + Util.slugify(props.credit_market_id), {
                                                                method: "POST",
                                                                headers: {
                                                                    "Content-Type": "application/json"
                                                                },
                                                                body: JSON.stringify({})
                                                            });

                                                            if (response.status === 200) {
                                                                setSuccessMessage("Satın alma işlemi başarılı!");
                                                                setPurchasing(null);
                                                            } else {
                                                                const data = await response.json();
                                                                // Bakiye yetersiz ise butonda göster
                                                                if (data.name && data.name.includes("yetersiz")) {
                                                                    setBalanceError(true);
                                                                    setPurchasing(null);
                                                                    // 2 saniye sonra normal haline döndür
                                                                    setTimeout(() => {
                                                                        setBalanceError(false);
                                                                    }, 2000);
                                                                } else {
                                                                    setErrorMessage(data.name);
                                                                    setPurchasing(null);
                                                                }
                                                            }
                                                        }}
                                                        className={`w-full py-3 px-4 flex items-center justify-between rounded-lg transition-all h-[52px] ${
                                                            balanceError 
                                                                ? 'bg-red-500 hover:bg-red-500 cursor-not-allowed' 
                                                                : 'bg-gray-600 hover:bg-gray-500'
                                                        }`}
                                                        disabled={purchasing === 'balance' || balanceError}
                                                    >
                                                        {purchasing === 'balance' ? (
                                                            <span className="w-full text-center text-sm">İşleniyor...</span>
                                                        ) : balanceError ? (
                                                            <span className="w-full text-center text-sm font-semibold">Bakiye Yetersiz!</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-semibold">Bakiye</span>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-lg font-bold">
                                                                        {new Intl.NumberFormat().format(price).replaceAll(",", ".")}
                                                                    </span>
                                                                    <span className="inline-block w-7 h-7">
                                                                        {lottie2}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Kart ile satın alma (Stripe) */}
                                                <div className="flex flex-col relative group">
                                                    <Button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (purchasing) return;
                                                            setPurchasing('card');
                                                            // Stripe Checkout Session oluştur
                                                            const response = await fetch("/api/payment/create-checkout", {
                                                                method: "POST",
                                                                headers: {
                                                                    "Content-Type": "application/json"
                                                                },
                                                                body: JSON.stringify({
                                                                    rank_id: props.credit_market_id,
                                                                    price_try: priceInTRY
                                                                })
                                                            });

                                                            if (response.ok) {
                                                                const { url } = await response.json();
                                                                window.location.href = url;
                                                            } else {
                                                                setErrorMessage("Ödeme sayfası oluşturulamadı");
                                                                setPurchasing(null);
                                                            }
                                                        }}
                                                        className="bg-green-500 hover:bg-green-400 w-full py-3 px-4 flex items-center justify-between rounded-lg transition-all h-[52px]"
                                                        disabled={purchasing === 'card'}
                                                    >
                                                        {purchasing === 'card' ? (
                                                            <span className="w-full text-center text-sm">Yönlendir...</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-semibold">Kart</span>
                                                                <span className="text-lg font-bold">
                                                                    {priceInTRY > 0 
                                                                        ? `${new Intl.NumberFormat().format(priceInTRY).replaceAll(",", ".")}₺`
                                                                        : "Yükleniyor..."}
                                                                </span>
                                                            </>
                                                        )}
                                                    </Button>
                                                    
                                                    {/* Hover Tooltip */}
                                                    {priceEurFormatted && (
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                                            <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-xs text-zinc-200 whitespace-nowrap">
                                                                <p className="font-semibold mb-1">Fiyat: {priceEurFormatted}</p>
                                                                <p className="text-zinc-400">Kur değişikliklerine tabi</p>
                                                                <p className="text-amber-300 text-xs mt-1">3D Doğrulama sayfasında teyit edin</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Önemli Uyarı - Butonların altında */}
                                            <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-2 w-full mt-1 mb-0">
                                                <div className="flex gap-2 items-start">
                                                    <span className="material-symbols-rounded text-amber-400 text-base flex-shrink-0">
                                                        warning
                                                    </span>
                                                    <p className="text-zinc-200 text-xs leading-tight">
                                                        <strong className="text-amber-300">{props.user?.email}</strong> emailinizi kullanarak ödeme yapmalısınız. Farklı email kullanırsanız rank hesabınıza tanımlanamaz.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                            : <p className="text-lg md:text-base text-zinc-200 max-w-[28rem] md:max-w-full text-center">
                                                Bu rütbeyi satın alabilmek için giriş yapmalısınız.
                                            </p>}
                    </div>
                </div>
            </PopUp>
            <div
        className={`p-6 md:p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-300
        bg-gradient-to-br from-dark-800 to-dark-900
        border-2 border-transparent
        ${currentRankColor.border} ${currentRankColor.shadow} hover:scale-105
        flex gap-6 md:gap-4 items-center relative md:flex-col`}
        data-aos="zoom-in"
        onMouseEnter={handleCardMouseEnter}
        onMouseLeave={handleCardMouseLeave}
        onClick={() => setShowPopup(true)}>
                <div>
                    <Image
                        className="animate__delay-0.5s"
                        id={iconId}
                        src={props.icon}
                        alt={props.title + " Icon"}
                        width={140}
                        height={140}
                        placeholder='blur'
                        blurDataURL={props.icon.replace("/uploads/", "/uploads/thumbnail_")}
                    />
                </div>
                <div className="flex-1 md:flex md:flex-col md:items-center">
                    <h2 className='text-2xl md:text-xl font-semibold mb-2 uppercase md:text-center'>
                        {props.title}
                    </h2>
                    <div className="md:flex md:flex-col md:items-center">
                        {discount &&
                            <div className="flex items-center gap-2">
                                <span className='text-zinc-400 text-xl line-through'>{new Intl.NumberFormat().format(_price).replaceAll(",", ".")}</span>
                            </div>
                        }
                        <div className="flex items-center gap-3">
                            {/* Bakiye fiyatı */}
                            <div className="flex items-center gap-1">
                                <h3 className='text-2xl md:text-xl font-semibold text-green-400'>
                                    {new Intl.NumberFormat().format(price).replaceAll(",", ".")}
                                </h3>
                                <div className='w-9 h-9'>
                                    {lottie}
                                </div>
                            </div>
                            
                            {/* TL fiyatı */}
                            <span className="text-zinc-400 text-xl">/</span>
                            <div className="flex items-center gap-1">
                                <h3 className={`text-2xl md:text-xl font-semibold ${currentRankColor.text}`}>
                                    {new Intl.NumberFormat().format(priceInTRY).replaceAll(",", ".")}
                                </h3>
                                <span className={`text-xl ${currentRankColor.text}`}>₺</span>
                            </div>
                        </div>
                        {
                            discount &&
                            <div className="text-zinc-200 text-lg mt-2 flex items-center gap-1">
                                <span className="material-symbols-rounded">
                                    timer
                                </span>
                                <span>
                                    Son {
                                        Util.msToTime(new Date(discount.end_date).getTime() - new Date().getTime())
                                            .replace(/,/g, "")
                                    }!
                                </span>
                            </div>
                        }
                    </div>
                    <Button
                        id={buttonId}
                        type="button"
                        onClick={() => {
                            if (props.user) {
                                if (props.user.player.rank !== "player") {
                                    setAlreadyHasARank(true);
                                }
                            }
                            setShowPopup(true);
                        }}
                        className={`mt-4 ${props.credit_market_id === 'cirak' ? 'bg-gray-500 hover:bg-gray-400' : 
                                          props.credit_market_id === 'asil' ? 'bg-orange-500 hover:bg-orange-400' :
                                          props.credit_market_id === 'soylu' ? 'bg-yellow-500 hover:bg-yellow-400' :
                                          props.credit_market_id === 'senyor' ? 'bg-purple-500 hover:bg-purple-400' :
                                          'bg-green-500 hover:bg-green-400'} w-fit md:w-full`}>
                        Özellikleri Gör
                    </Button>
                </div>
            </div>
        </>
    )
}