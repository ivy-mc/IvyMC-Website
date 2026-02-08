import React from "react";
import GuideManager, { Guide } from "@/lib/server/guides/GuideManager";
import AuthManager from "@/lib/server/auth/AuthManager";
import Util from "@/lib/common/Util";
import { GetServerSideProps } from "next";
import Markdown from "react-markdown";
import Layout from "@/layouts/Layout";
import styles from "@/styles/blog.module.scss";
import { PageProps } from "@/types";
import { User } from "@/lib/server/auth/AuthManager";
import Button from "@/components/common/Button";
import styles2 from "@/styles/guides.module.scss";

type GuideProps = {
    guide: Guide
    user: User
} & PageProps;

GuidePage.getLayout = function getLayout(page: React.ReactNode, pageProps: GuideProps) {
    return (
        <Layout
            title={"IvyMC - " + pageProps.guide.attributes.title}
            description={Util.cleanMarkdown(pageProps.guide.attributes.description).slice(0, 150)}
            ogDescription={Util.cleanMarkdown(pageProps.guide.attributes.description).slice(0, 150)}
            user={pageProps.user}
        >
            {page}
        </Layout>
    )
}

export default function GuidePage({ guide, user }: GuideProps) {
    return (
        <div className="mt-28 md:mt-20">
            <div data-aos="fade-down" className="flex flex-col bg-dark-800 p-8 md:p-6 rounded-lg shadow-lg gap-4">
                <div>
                    <h2 className="text-xl font-semibold uppercase text-zinc-400">{guide.attributes.sub_title}</h2>
                    <h1 className="text-4xl md:text-3xl sm:text-2xl tracking-wider font-semibold mt-2">{guide.attributes.title}</h1>
                </div>
                <div>
                    <Button href={"/discord"}
                        blank
                        type="link"
                        className="bg-dark-200 hover:bg-dark-100 text-white w-fit">
                        Daha Fazla Bilgi
                    </Button>
                </div>
            </div>
            <div id="guide" className={styles.blog} data-aos="fade-up">
                <Markdown>{guide.attributes.description}</Markdown>
            </div>
        </div>
    )
}

export const getServerSideProps = (async (ctx) => {
    // Ensure guides are fetched (will use cache or fetch fresh data)
    const guides = await GuideManager.getInstance().getGuides();
    const guide = guides.find(guide => guide.attributes.path === ctx.params?.guide);
    if (!guide) {
        return {
            notFound: true
        }
    }
    return {
        props: {
            guide: guide,
            user: await AuthManager.getInstance().getUserFromContext(ctx)
        }
    }
}) satisfies GetServerSideProps<{ guide: Guide, user: User | null }>