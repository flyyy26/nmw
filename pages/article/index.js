import { useState } from 'react';
import styles from "@/styles/Article.module.css"
import banner from "@/styles/Banner.module.css"
import Link from 'next/link';
import { HiArrowLongRight } from "react-icons/hi2";
import { useEffect } from 'react';
import Head from 'next/head';
import loadingStyles from "@/styles/Loading.module.css";

export default function Article() {
  const [catalogs, setCatalogs] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const mainUrl = process.env.NEXT_PUBLIC_API_MAIN_URL;
  const storageUrl = process.env.NEXT_PUBLIC_API_STORAGE_URL;

  useEffect(() => {
    const fetchData = async () => {
        const cachedData = localStorage.getItem('promoCache');
        const cacheExpiry = localStorage.getItem('promoCacheExpiry');
        const now = new Date().getTime();

        try {
            const response = await fetch(`${baseUrl}/catalog`);
            const data = await response.json();

            if (data && data.data) {
                if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
                    const parsedCache = JSON.parse(cachedData);
                    
                    if (JSON.stringify(parsedCache) !== JSON.stringify(data.data)) {
                        console.log('Data updated from API');
                        setCatalogs(data.data);
                        localStorage.setItem('promoCache', JSON.stringify(data.data));
                        localStorage.setItem('promoCacheExpiry', (now + 6 * 60 * 60 * 1000).toString());
                    } else {
                        console.log('Loaded from cache');
                        setCatalogs(parsedCache);
                    }
                } else {
                    console.log('Fetched from API');
                    setCatalogs(data.data);
                    localStorage.setItem('promoCache', JSON.stringify(data.data));
                    localStorage.setItem('promoCacheExpiry', (now + 6 * 60 * 60 * 1000).toString());
                }
            } else {
                console.error('Invalid response data format:', data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            if (cachedData) {
                setCatalogs(JSON.parse(cachedData));
                console.log('Loaded from cache after API error');
            }
        }
    };

    fetchData();
  }, [baseUrl]);

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `Katalog - NMW Aesthetic Clinic`,
        description: `Lihat dan download katalog NMW Aesthetic Clinic`,
        url: `${mainUrl}/catalog`,
        publisher: {
        "@type": "Organization",
        name: "NMW Aesthetic Clinic",
        logo: {
            "@type": "ImageObject",
            url: `${mainUrl}/images/catalogue-banner.png`
        }
        },
        mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${mainUrl}/catalog`
        },
        breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: `${mainUrl}`
                },
                {
                "@type": "ListItem",
                position: 2,
                    name: "Katalog",
                    item: `${mainUrl}/catalog`
                }
            ]
        }
    };

  return (
    <>
        <Head>
          <title>Artikel | NMW Aesthetic Clinic</title>
          <meta name="description" content="Artikel terkait layanan estetika dan perawatan kulit dari NMW Aesthetic Clinic." />
          <meta name="keywords" content="Artikel NMW Aesthetic Clinic, Perawatan Estetika, Layanan Kecantikan, Artikel Kesehatan Kulit, Tips Kecantikan, NMW Aesthetic Clinic Blog, Artikel Terbaru Kecantikan, Perawatan Kulit Wajah, Perawatan Tubuh, Kecantikan Wanita, Artikel Kecantikan Terpercaya, NMW Estetika, Artikel Perawatan Kulit, Klinik Kecantikan, Tips Perawatan Kulit" />

          <meta property="og:title" content="Artikel | NMW Aesthetic Clinic"  />
          <meta property="og:description" content="Artikel terkait layanan estetika dan perawatan kulit dari NMW Aesthetic Clinic." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`${mainUrl}/article`} />
          <meta property="og:image" content={`${mainUrl}/images/logo.svg`} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Artikel | NMW Aesthetic Clinic" />
          <meta name="twitter:description" content="Artikel terkait layanan estetika dan perawatan kulit dari NMW Aesthetic Clinic." />
          <meta name="twitter:image" content={`${mainUrl}/images/logo.svg`} />

          <link rel="canonical" href={`${mainUrl}/article`} />

          <script type="application/ld+json">
          {JSON.stringify(schemaData)}
          </script>
      </Head>
      <div className={banner.banner}>
        <img
          src="/images/catalogue-banner.png"
          alt="Kebijakan Privasi NMW Aesthetic Clinic"
        />
      </div>
      <div className={styles.container}>
        <div className={`${styles.heading_section}`}>
            <h1><font>Katalog</font> Harga</h1>
        </div>
            <div className={styles.box_galeri_layout}>
                {catalogs.map(catalog => (
                    <div className={styles.box_galeri} key={catalog.id}>
                        <div className={styles.box_galeri_image}>
                            <img src={`${storageUrl}/${catalog.image}`} alt={catalog.title}/>
                        </div>
                        <div className={styles.box_galeri_content}>
                            <div className={styles.box_galeri_heading}>
                                <h1>{catalog.title}</h1>
                            </div>
                            <div className={styles.box_galeri_text}>
                                <p>Terakhir Diperbaharui</p>
                                <p>{new Date(catalog.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className={styles.box_galeri_button}>
                            <Link href={`${storageUrl}/${catalog.document}`} target="blank_"><button>Unduh</button></Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className={styles.section_4}>
            <div className={styles.heading_section_4}>
                <div className={`${styles.heading_section} ${styles.heading_section_start}`}>
                    <h1><font>Dokter </font>Kami</h1>
                </div>
            </div>
            <div className={styles.section_4_box}>
            <img src="images/nmw_dokter.png" alt="Dokter-dokter NMW Aesthetic Clinic" className={styles.our_dokter} />
            <img src="images/blink_orange.svg" alt="Blink Material" className={styles.section_icon_5} />
            <img src="images/blink_grey.svg" alt="Blink Material" className={styles.section_icon_6} />
            <div className={styles.section_4_content}>
                <p>Dokter NMW Aesthetic Clinic adalah dokter terpilih, terlatih secara profesional, dan terpercaya untuk melakukanbedah plastik, dermatologi, spesialis kulit dan kelamin dan perawatan kulit ekstetika.</p>
                <p>Dokter kami telah menjalani pelatihan ekstensif dan memiliki keahlian untuk memberikan hasil luar biasa sekaligus memastikan keselamatan pasien.</p>
                <Link href={'/dokter-kami'}><button>Lihat Lebih Lanjut</button></Link>
            </div>
            </div>
        </div>
    </>
  );
}