import "@/styles/popup.module.scss";
import { useEffect, useState } from 'react'

type PopUpProps = {
    show: boolean;
    footer?: JSX.Element | null;
    title?: string | JSX.Element;
    onClose?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    children: JSX.Element;
    rankColor?: {
        border: string;
        shadow: string;
        gradient: string;
    };
};

export default function PopUp(popUpProps: PopUpProps) {
    const [outing, setOuting] = useState(false);
    const [firstRender, setFirstRender] = useState(false);

    // Varsayılan yeşil renkler
    const defaultRankColor = {
        border: '#2ecc71',
        shadow: '0 0 20px rgba(46, 204, 113, 0.5), 0 0 40px rgba(46, 204, 113, 0.3), 0 0 60px rgba(46, 204, 113, 0.1)',
        gradient: 'linear-gradient(135deg, #1a4d2e 0%, #1e5a35 100%)'
    };

    const rankColor = popUpProps.rankColor || defaultRankColor;

    useEffect(() => {
        if (!firstRender) {
            setFirstRender(true);
            return;
        };

        if (!popUpProps.show) {
            setOuting(true);
            setTimeout(() => {
                setOuting(false);
            }, 250);
        }
    }, [popUpProps.show]);

    return (
        <div className={"popup z-50" + (popUpProps.show ? " active" : "") + (outing ? " outing" : "")}>
            <div 
                className={"popup__content popup__content--custom"} 
                onMouseEnter={popUpProps.onMouseEnter} 
                onMouseLeave={popUpProps.onMouseLeave}
                style={{
                    background: rankColor.gradient,
                    border: `2px solid ${rankColor.border}`,
                    boxShadow: rankColor.shadow,
                    ['--shadow-base' as any]: rankColor.shadow,
                    ['--shadow-pulse' as any]: rankColor.shadow
                        .replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/g, 
                            (match, r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${(parseFloat(a) * 1.7).toFixed(1)})`
                        )
                }}
            >
                <div className={"popup__content__header"}>
                    <h3 className="font-semibold text-2xl"
                    >{popUpProps.title}</h3>
                    <span className="material-symbols-rounded" onClick={popUpProps.onClose}>close</span>
                </div>
                <div className={"popup__content__body"}>
                    {popUpProps.children}
                </div>
                <div className={"popup__content__footer"}>
                    {popUpProps.footer}
                </div>
            </div>
        </div>
    )
}