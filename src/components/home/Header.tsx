import Image from "next/image";
import React from "react";
import Button from "../common/Button";

export default function Hero() {
    const [copied, setCopied] = React.useState<boolean>(false);
    const [isHovered, setIsHovered] = React.useState<boolean>(false);
    const [playerCount, setPlayerCount] = React.useState<number>(0);
    const [online, setOnline] = React.useState<boolean>(false);

    React.useEffect(() => {
        (async () => {
            const res = await fetch("/api/server");
            const data = await res.json();
            setPlayerCount(data.player_count);
            setOnline(data.online);
        })();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText("Oyna.IvyMC.Com");
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    return (
        <>
            <header data-aos="fade-down" data-offset="100">
                <div className="flex flex-col justify-center items-center h-[47rem]">
                    <Image className=""
                        src="https://res.cloudinary.com/dkcpwrjza/image/upload/v1768571477/logo_3619be7de1.png" alt="Logo"
                        quality={100}
                        placeholder="empty"
                        width={245 * 2.6}
                        height={53 * 2.6}
                    />
                    <div className="mt-10"
                        onMouseEnter={() => !copied && setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}>
                        <button 
                            onClick={handleCopy}
                            className="flex items-center space-x-2 text-center text-lg rounded-md font-bold text-white 
                            transition-all duration-300 leading-7 px-8 py-4 cursor-pointer shadow-lg
                            bg-gray-500/85 hover:bg-gray-500 min-w-[340px] h-[60px] justify-center overflow-hidden relative">
                            <div className={`flex items-center space-x-2 transition-all duration-300 ease-out absolute
                                ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                                <span className="material-symbols-rounded !text-4xl !max-w-[36px]">
                                    done
                                </span>
                                <span className="text-green-300">Kopyalandı!</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-all duration-300 ease-out absolute
                                ${isHovered && !copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                                <span className="material-symbols-rounded !text-4xl !max-w-[36px]">
                                    content_copy
                                </span>
                                <span>Panoya Kopyala</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-all duration-300 ease-out absolute
                                ${!isHovered && !copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                                <span className="material-symbols-rounded !text-4xl !max-w-[36px]">
                                    sports_esports
                                </span>
                                <span>Oyna.IvyMC.Com</span>
                                <span>{playerCount}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>
        </>
    )
}