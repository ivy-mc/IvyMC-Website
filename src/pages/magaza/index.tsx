import Button from '@/components/common/Button'
import PopUp from '@/components/common/PopUp'
import GuideCard from '@/components/guides/GuideCard'
import CategoryCard from '@/components/store/CategoryCard'
import Layout from '@/layouts/Layout'
import AuthManager, { User } from '@/lib/server/auth/AuthManager'
import GuideManager, { Guide } from '@/lib/server/guides/GuideManager'
import { PageProps } from '@/types'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'

type StoreProps = InferGetServerSidePropsType<typeof getServerSideProps> & PageProps


StorePage.getLayout = function getLayout(page: React.ReactNode, pageProps: StoreProps) {
    return (
        <Layout
            title="IvyMC - Mağaza"
            description="Ayrıcalıklarımızı keşfedin, kredi yükleyin ve mağazamızdan alışveriş yapın!"
            ogDescription="Ayrıcalıklarımızı keşfedin, kredi yükleyin ve mağazamızdan alışveriş yapın!"
            user={pageProps.user}
        >
            {page}
        </Layout>
    )
}

export default function StorePage({ user }: StoreProps) {
    const router = useRouter();
    const [showPopup, setShowPopup] = React.useState(false);

    return (
        <>
            <div className='mt-28 md:mt-20' data-aos="fade-down">
                <div
                    className='flex flex-col relative py-16 px-12 md:py-10 md:px-6 sm:py-8 sm:px-4 rounded-lg shadow-lg 
                    bg-cover bg-center bg-no-repeat overflow-hidden
                    md:items-center'
                    style={{
                        backgroundImage: `url("/assets/store/magaza-bg.png")`
                    }}>
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg"></div>
                    
                    <h1 className='text-4xl md:text-center font-semibold z-20 relative'>IvyMC Mağaza</h1>
                    <p className='text-xl md:text-center mt-4 z-20 relative'>Avantajlarımızı keşfedin, kredi yükleyin ve mağazamızdan alışveriş yapın!</p>
                    {user &&
                        <Button blank type="link" href="/kredi-yukle" className="z-20 mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 w-fit md:m-0 md:mt-4 relative">Kredi Yükle</Button>
                    }
                </div>
            </div>
            <div className='mt-12 flex flex-wrap gap-8'>
                <CategoryCard
                    title="Rütbeler"
                    href='/magaza/rutbeler'
                    description="Sunucumuzda bulunan rütbeleri inceleyin ve avantajları keşfedin."
                    icon="/assets/store/rutbe-icon.png"
                    button_text='Rütbeleri İncele'
                />
                <PopUp
                    show={showPopup}
                    title="KASALAR"
                    footer={
                        <Button
                            type="button"
                            onClick={() => {
                                setShowPopup(false);
                            }}
                            className="bg-blue-500 hover:bg-blue-400 w-fit"
                        >
                            Tamam
                        </Button>
                    }
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2 p-4">
                            <p className="text-lg text-zinc-200 max-w-[28rem] text-center">
                                Kasaları oyun içerisinde inceleyebilir ve <br />/kredi-market menüsünden satın alabilirsiniz.
                            </p>
                        </div>
                    </div>
                </PopUp>
                <CategoryCard
                    title="Kasalar"
                    setShowPopup={setShowPopup}
                    href='/magaza'
                    description="Sunucumuzda bulunan kasaları inceleyin ve içeriklerini keşfedin."
                    icon="/assets/store/kasa-icon.png"
                    button_text='Kasaları İncele'
                />
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