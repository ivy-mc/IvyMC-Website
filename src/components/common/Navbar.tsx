import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Button from "./Button";
import { User } from "@/lib/server/auth/AuthManager";
import UUIDManager from "@/lib/client/UUIDManager";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/navbar.module.scss";

declare namespace JSX {
    interface IntrinsicElements {
        "lottie-player": any;
    }
};

export default function Navbar(navbarProps: {
    user: User | null;
}) {
    const navigators = [
        {
            name: "Ana Sayfa",
            url: "/",
            bg: "bg-green-500"
        },
        {
            name: "Haberler",
            url: "/haberler",
            bg: "bg-green-500"
        },
        {
            name: "Rehber",
            url: "/rehber",
            bg: "bg-green-500"
        },
        {
            name: "Mağaza",
            url: "/magaza",
            bg: "bg-green-500",
            special: true
        }
    ]

    if (navbarProps.user) {
        navigators.push({
            name: "Kredi Yükle",
            url: "/kredi-yukle",
            bg: "bg-purple-500"
        });
    }

    const router = useRouter();
    const [avatar, setAvatar] = React.useState<string>("https://render.skinmc.net/3d.php?user=MustafaCan&vr=-5&hr0&hrh=25&aa=1&headOnly=true&ratio=10");

    const [menuOpen, setMenuOpen] = React.useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (navbarProps.user) {
                const uuid = await UUIDManager.getInstance().getUUID(navbarProps.user.username);
                setAvatar(`https://render.skinmc.net/3d.php?user=${uuid}&vr=-5&hr0&hrh=25&aa=1&headOnly=true&ratio=10`);
            }
        })();
    }, []);

    const coinRef = React.createRef<HTMLTemplateElement>();

    // @ts-ignore
    const coinIcon = (
        <lottie-player
            id="navbar_coin_icon"
            ref={coinRef}
            speed={1}
            loop={true}
            autoplay={true}
            mode="normal"
            style={{ width: '28px', height: '28px', marginTop: '1px', pointerEvents: 'none' }}
            src="https://res.cloudinary.com/dkcpwrjza/raw/upload/v1768665447/Diamond_green_v3_dc1fdd7199.json"
        />
    );

    const menuButton = <button className={
        `hidden lg:block ${styles["navbar-toggle-button"]}${menuOpen ? " " + styles["active"] : ""}`
    }
        onClick={() => {
            setMenuOpen(!menuOpen);
        }}
    >
        <span></span>
        <span></span>
        <span></span>
    </button>

    return (
        <header className="flex justify-center w-full">
            <div className="glow"></div>
            <nav className="flex justify-between backdrop-blur items-center py-5 fixed z-30 container">
                <div>
                    {menuButton}
                    <div className={`flex items-center space-x-4 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 ` +
                        `lg:z-50 lg:bg-black/90 lg:rounded-lg lg:py-8 lg:px-8 lg:top-0 lg:w-full lg:h-screen ` +
                        `lg:flex-col lg:justify-start lg:items-center lg:space-y-4 lg:gap-4 navbar-mobile-menu ` +
                        `${menuOpen ? " active" : ""}`}>
                        {menuButton}
                        <ul className="flex space-x-4 font-semibold items-center lg:w-full !m-0 
                        lg:flex-col lg:space-y-4 lg:space-x-0 lg:absolute lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2">
                            {navigators.map((navigator, index) => (
                                <li key={index} className="flex items-center" onClick={() => {
                                    setMenuOpen(false);
                                }}>
                                    {navigator.special ? (
                                        <div className={styles["store-button-wrapper"] + 
                                            (((navigator.url == "/" && router.pathname == "/") ||
                                            (navigator.url != "/" && router.pathname.startsWith(navigator.url))) ? 
                                            " " + styles["active"] : "")}>
                                            <Button
                                                type="link" href={navigator.url}
                                                blank={navigator.url.startsWith("http") || navigator.url.includes("kredi-yukle")}
                                                className="hover:bg-transparent lg:!text-2xl lg:px-10 lg:py-2">
                                                {navigator.name}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            type="link" href={navigator.url}
                                            blank={navigator.url.startsWith("http") || navigator.url.includes("kredi-yukle")}
                                            className={((navigator.url == "/" && router.pathname == "/") ||
                                                (navigator.url != "/" && router.pathname.startsWith(navigator.url))
                                                ? `${navigator.bg} ` : "") + `hover:${navigator.bg} lg:!text-2xl lg:px-10 lg:py-2`}>
                                            {navigator.name}
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="flex space-x-4">
                    {!navbarProps.user && (<>
                        <Button type="link" href="/kaydol" className="bg-orange-500 hover:!bg-orange-400">
                            <span>Kaydol</span>
                        </Button>
                        <Button type="link" href="/giris-yap" className="bg-blue-500 hover:!bg-blue-400">
                            <span>Giriş Yap</span>
                        </Button></>)}
                    {
                        navbarProps.user && (
                            <div className="flex items-center gap-2">
                                <Link href={`/profil`} className="flex items-center gap-2">
                                    <div
                                        className="flex flex-col">
                                        <div className="flex items-center justify-center font-medium leading-5">
                                            <span>{navbarProps.user.username}</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 text-base text-zinc-300">
                                            <span>
                                                {new Intl.NumberFormat().format(navbarProps.user.player.credit).replaceAll(",", ".")}
                                            </span>
                                            <span className="w-7 h-7 flex items-center justify-center">
                                                {coinIcon}
                                            </span>
                                        </div>
                                    </div>
                                    <Image
                                        className="ml-2"
                                        unoptimized
                                        src={avatar} alt="Avatar" width={56} height={56} />
                                </Link>
                                <div className="ml-2 flex items-center text-zinc-300 font-semibold hover:text-zinc-100 cursor-pointer duration-300"
                                    onClick={async () => {
                                        await fetch("/api/auth/logout", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            credentials: "include"
                                        });
                                        router.reload();
                                    }}>
                                    <span className="material-symbols-rounded !text-4xl !max-w-[36px]">
                                        logout
                                    </span>
                                </div>
                            </div>
                        )
                    }
                </div>
            </nav>
        </header>
    );
}