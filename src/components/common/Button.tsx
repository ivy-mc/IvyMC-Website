import Link from "next/link";
import React, { useEffect, useRef } from "react";
import PopUp from "./PopUp";
import { createRoot, Root } from "react-dom/client";
import Image from "next/image";

export type ButtonProps = {
    id?: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
} & (
        {
            type: "link";
            href: string;
            blank?: boolean;
        } | {
            type: "button";
            onClick: () => void;
        }
    )

export default function Button(props: ButtonProps) {
    const { children, className = "", type } = props;
    const classNames = `flex items-center space-x-2 text-center text-lg rounded-md font-semibold text-white transition duration-300 leading-7 px-5 py-2 cursor-pointer${className.includes(" bg-") ? " shadow-lg" : ""} ${className}`;

    const coinRef = React.useRef(null);
    const [showPopUp, setShowPopUp] = React.useState<boolean>(false);

    // @ts-ignore
    const lottie = <lottie-player
        id="navbar_coin"
        ref={coinRef}
        speed={1}
        loop={true}
        mode="normal"
        autoplay={true}
        style={{ pointerEvents: 'none' }}
        src="https://res.cloudinary.com/dkcpwrjza/raw/upload/v1768665447/Diamond_green_v3_dc1fdd7199.json"
    />
    const rootRef = useRef<Root | null>(null);

    const popupTitle = (
        <div className="flex items-center justify-center gap-2">
            <lottie-player
                speed={1}
                loop={true}
                autoplay={true}
                mode="normal"
                style={{ width: '32px', height: '32px', pointerEvents: 'none' }}
                src="https://res.cloudinary.com/dkcpwrjza/raw/upload/v1768665447/Diamond_green_v3_dc1fdd7199.json"
            />
            <span>Mücevher Satın Al</span>
        </div>
    );

    const popUp = (
        <PopUp show={showPopUp} title={popupTitle}
            footer={null}
            onClose={() => {
                setShowPopUp(false);
            }}>
            <>
                <div className="flex flex-row gap-4 items-center h-full">
                    {/* Sol Taraf - Görsel */}
                    <div className="flex-1 flex items-center justify-center min-w-0">
                        <Image
                            className="w-full h-auto rounded-lg overflow-hidden shadow-lg object-contain"
                            src="https://res.cloudinary.com/dkcpwrjza/image/upload/v1768726797/shoppingcart_e4a105470c.png"
                            alt="Kredi Yükle"
                            width={300}
                            height={240}
                            placeholder="empty"
                        />
                    </div>
                    
                    {/* Sağ Taraf - Bilgilendirmeler ve Buton */}
                    <div className="flex-1 flex flex-col gap-3 justify-center min-w-0">
                        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3">
                            <p className="text-sm text-yellow-200 font-semibold mb-1">
                                ⚠️ Önemli Uyarı
                            </p>
                            <p className="text-xs text-yellow-100 leading-tight">
                                Ödeme sırasında gireceğiniz <strong>e-posta adresinizin</strong>, 
                                IvyMC hesabınıza kayıtlı e-posta ile <strong>aynı olması gerekmektedir!</strong>
                            </p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                            <p className="text-xs text-blue-200 leading-tight">
                                ℹ️ Mücevherler ödeme sonrası <strong>1-2 dakika içinde</strong> otomatik olarak hesabınıza eklenecektir.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button type="button" onClick={() => {
                                setShowPopUp(false);
                                window.open("/kredi-yukle", "_blank");
                            }} className="bg-green-500/85 hover:bg-green-500 px-4 py-2.5 w-full justify-center text-base">
                                Satın Almaya Devam Et
                            </Button>
                            <div className="flex items-center justify-center gap-3 py-2">
                                {/* SSL Security Badge */}
                                <svg className="h-6 opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-200" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="#10b981" strokeWidth="2" fill="none"/>
                                    <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="12" cy="16" r="1.5" fill="#10b981"/>
                                </svg>
                                {/* Visa Logo */}
                                <div className="opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer">
                                    <img 
                                        src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" 
                                        alt="Visa" 
                                        className="h-4 brightness-0 invert"
                                    />
                                </div>
                                {/* Mastercard Logo */}
                                <svg className="h-6 opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer" viewBox="0 0 48 32" fill="none">
                                    <circle cx="15" cy="16" r="11" fill="#EB001B" opacity="0.8"/>
                                    <circle cx="33" cy="16" r="11" fill="#F79E1B" opacity="0.8"/>
                                    <path d="M24 7.5c-2.4 1.9-4 4.9-4 8.5s1.6 6.6 4 8.5c2.4-1.9 4-4.9 4-8.5s-1.6-6.6-4-8.5z" fill="#FF5F00" opacity="0.9"/>
                                </svg>
                                {/* Buy Me a Coffee Logo */}
                                <div className="opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer">
                                    <img 
                                        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                                        alt="Buy Me a Coffee" 
                                        className="h-5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </PopUp>
    );
    
    if (type === "link") {
        const { href } = (props as any);
        if (href.includes("kredi-yukle")) {

            useEffect(() => {
                if (showPopUp && rootRef.current) {
                    rootRef.current.render(popUp);
                };
            }, [popUp]);

            useEffect(() => {
                let popUpWrapper = document.getElementById("popup-wrapper");

                if (rootRef.current && !showPopUp && popUpWrapper) {
                    rootRef.current.render(popUp);

                    setTimeout(() => {
                        rootRef.current?.unmount();
                        popUpWrapper?.remove();
                        rootRef.current = null;
                    }, 250);
                    return;
                } else if (popUpWrapper) {
                    popUpWrapper.remove();
                }

                popUpWrapper = document.createElement("div");
                popUpWrapper.id = "popup-wrapper";
                document.body.firstChild?.appendChild(popUpWrapper);

                rootRef.current = createRoot(popUpWrapper);
                rootRef.current.render(popUp);
            }, [showPopUp]);

            return (
                <button
                    id={props.id} className={classNames + " lg:ml-6"}
                    onClick={() => {
                        setShowPopUp(true);
                    }}
                >{children}<span className="w-10 h-10 ml-2 mt-0.5"> {lottie} </span></button>
            )
        }

        return (
            <Link
                href={href} id={props.id} className={classNames}
                target={href.includes("http") ? "_blank" : props.blank ? "_blank" : "_self"}
            >{children}</Link>
        )
    } else {
        const { onClick } = (props as any);
        return (
            <button
                onClick={props.disabled ? undefined : onClick} 
                id={props.id} 
                className={`${classNames}${props.disabled ? ' opacity-50 cursor-not-allowed' : ''}`}
                disabled={props.disabled}
            >
                {children}
            </button>
        )
    }
}