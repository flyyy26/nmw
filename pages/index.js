import styles from "@/styles/Home.module.css";
import { FaWhatsapp } from "react-icons/fa";
import React, { useRef, useState, useEffect } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Controller } from "swiper/modules";
import Link from "next/link";
import { HiOutlineArrowLongRight } from "react-icons/hi2";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Head from "next/head";
import { Pagination, Autoplay } from 'swiper/modules';

export default function Home() {
  const [firstSwiper, setFirstSwiper] = useState(null);
  const [secondSwiper, setSecondSwiper] = useState(null);

  const [settings, setSettings] = useState([]);
  const [articles, setArticles] = useState([]);
  const [services, setServices] = useState([]);
  const [promos, setPromos] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({});

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const storageUrl = process.env.NEXT_PUBLIC_API_STORAGE_URL;
  const mainUrl = process.env.NEXT_PUBLIC_API_MAIN_URL;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await fetch(`${baseUrl}/article-new`);
            const data = await response.json();
            if (data && data.data) { // Pastikan data dan data.data ada
                // Ambil artikel dari data.data
                const articles = data.data;

                // Urutkan artikel berdasarkan 'date' dan 'created_at' yang paling baru
                const sortedArticles = articles.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    const createdAtA = new Date(a.created_at);
                    const createdAtB = new Date(b.created_at);

                    // Urutkan berdasarkan 'date' jika ada, jika tidak, urutkan berdasarkan 'created_at'
                    return (dateB - dateA) || (createdAtB - createdAtA);
                });

                // Ambil 3 artikel pertama setelah diurutkan
                setArticles(sortedArticles.slice(0, 3));
            } else {
                console.error('Invalid response data format:', data);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    fetchData();
}, []);    

  useEffect(() => {
    const fetchData = async () => {
        const cachedSetting = localStorage.getItem('settingCache');
        const cachedSettingExpired = localStorage.getItem('settingCacheExpired');
        const now = new Date().getTime();

        // Cek apakah cache valid
        if (cachedSetting && cachedSettingExpired && now < parseInt(cachedSettingExpired)) {
            setSettings(JSON.parse(cachedSetting));
            setIsLoading(false);
            
            // Lakukan pengecekan data API untuk pembaruan data
            try {
                const response = await fetch(`${baseUrl}/setting`);
                const data = await response.json();

                if (data && data.social_media) {
                    const cachedData = JSON.parse(cachedSetting);
                    
                    // Bandingkan data baru dengan cache
                    if (JSON.stringify(data) !== JSON.stringify(cachedData)) {
                        setSettings(data);
                        localStorage.setItem('settingCache', JSON.stringify(data));
                        localStorage.setItem('settingCacheExpired', (now + 86400000).toString());
                        console.log('Cache updated after API check');
                    } else {
                        console.log('No changes detected in API data');
                    }
                } else {
                    console.error('Invalid API response:', data);
                }
            } catch (error) {
                console.error('Error checking API for updates:', error);
            }
            return;
        }

        // Fetch data jika tidak ada cache atau cache sudah kadaluarsa
        try {
            const response = await fetch(`${baseUrl}/setting`);
            const data = await response.json();

            if (data && data.social_media) {
                setSettings(data);
                localStorage.setItem('settingCache', JSON.stringify(data));
                localStorage.setItem('settingCacheExpired', (now + 86400000).toString());
                console.log('Fetched and cached from API');
            } else {
                console.error('Invalid API response:', data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [baseUrl]);

  useEffect(() => {
      const fetchServices = async () => {
          setIsLoading(true); // Tambahkan ini di awal
          const cachedServices = localStorage.getItem('servicesCache');
          const cachedDetails = localStorage.getItem('serviceDetailsCache');
          const cacheExpiry = localStorage.getItem('servicesCacheExpiry');
          const now = new Date().getTime();

          if (cachedServices && cachedDetails && cacheExpiry && now < parseInt(cacheExpiry)) {
              setServices(JSON.parse(cachedServices));
              setServiceDetails(JSON.parse(cachedDetails));
              setIsLoading(false); 
              console.log('Loaded from cache');
              return;
          }

          try {
              const response = await fetch(`${baseUrl}/service`);
              const data = await response.json();

              if (data && data.data) {
                  setServices(data.data);

                  const serviceDetailsPromises = data.data.map(async (service) => {
                      const responseDetail = await fetch(`${baseUrl}/service_detail/${service.id}`);
                      const detailData = await responseDetail.json();
                      return { id: service.id, detail: detailData?.data };
                  });

                  const resolvedDetails = await Promise.all(serviceDetailsPromises);
                  const detailsMap = resolvedDetails.reduce((acc, { id, detail }) => {
                      if (detail) acc[id] = detail;
                      return acc;
                  }, {});

                  setServiceDetails(detailsMap);

                  localStorage.setItem('servicesCache', JSON.stringify(data.data));
                  localStorage.setItem('serviceDetailsCache', JSON.stringify(detailsMap));
                  localStorage.setItem('servicesCacheExpiry', (now + 6 * 60 * 60 * 1000).toString()); 
                  console.log('Fetched from API and updated cache');
              } else {
                  console.error('Invalid response data format:', data);
              }
          } catch (error) {
              console.error('Error fetching services or details:', error);
          } finally {
              setIsLoading(false); 
          }
      };

      fetchServices();
  }, [baseUrl]);


  useEffect(() => {
    const fetchData = async () => {
        const cachedData = localStorage.getItem('promoCache');
        const cacheExpiry = localStorage.getItem('promoCacheExpiry');
        const now = new Date().getTime();

        try {
            const response = await fetch(`${baseUrl}/promo`);
            const data = await response.json();

            if (data && data.data) {
                if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
                    const parsedCache = JSON.parse(cachedData);
                    
                    if (JSON.stringify(parsedCache) !== JSON.stringify(data.data)) {
                        console.log('Data updated from API');
                        setPromos(data.data);
                        localStorage.setItem('promoCache', JSON.stringify(data.data));
                        localStorage.setItem('promoCacheExpiry', (now + 6 * 60 * 60 * 1000).toString());
                    } else {
                        console.log('Loaded from cache');
                        setPromos(parsedCache);
                    }
                } else {
                    console.log('Fetched from API');
                    setPromos(data.data);
                    localStorage.setItem('promoCache', JSON.stringify(data.data));
                    localStorage.setItem('promoCacheExpiry', (now + 6 * 60 * 60 * 1000).toString());
                }
            } else {
                console.error('Invalid response data format:', data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            if (cachedData) {
                setPromos(JSON.parse(cachedData));
                console.log('Loaded from cache after API error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [baseUrl]);


  const midIndex = Math.ceil(services.length / 2);
  const firstHalf = services.slice(0, midIndex); // First half of the services
  const secondHalf = services.slice(midIndex); 

  const formattedPhone = settings.phone && settings.phone.startsWith('0')
    ? '62' + settings.phone.slice(1)  // Replace the first 0 with 62
    : settings.phone;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Home - NMW Aesthetic Clinic",
    description: "NMW Adalah merek Aesthetic, Skincare, Dermatology and Wellness Clinic yang berbasis di Jakarta, Indonesia. Jam Operasional Klinik 09:00 - 20:00",
    url: `${mainUrl}`,
    publisher: {
      "@type": "Organization",
      name: "NMW Aesthetic Clinic",
      logo: {
        "@type": "ImageObject",
        url: `${storageUrl}/${settings.logo}`
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${mainUrl}`
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [{
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${mainUrl}`
      }]
    }
  };

  

  return (
    <>
      <Head>
          <title>Official NMW - Klinik Aesthetic, Skincare, Dermatologi Jakarta</title>
          <meta name="description" content="NMW Adalah merek Aesthetic, Skincare, Dermatology and Wellness Clinic yang berbasis di Jakarta, Indonesia. Jam Operasional Klinik 09:00 - 20:00" />
          <meta name="keywords" content="klinik kesehatan, layanan medis, konsultasi kesehatan, NMW Clinic, perawatan medis, bedah plastik" />
          
          <meta property="og:title" content="NMW Aesthetic Clinic" />
          <meta property="og:image" content={`${storageUrl}/${settings.favicon}`} />
          <meta property="og:url" content={mainUrl} />
          <meta property="og:type" content="website" />
          
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="NMW Aesthetic Clinic" />
          <meta name="twitter:description" content={settings.meta_description} />
          <meta name="twitter:image" content={`${storageUrl}/${settings.favicon}`} />

          <link rel="icon" href={`${storageUrl}/${settings.favicon}`} />

          <link rel="canonical" href={mainUrl} />

          <script type="application/ld+json">
            {JSON.stringify(schemaData)}
          </script>
      </Head>
      {isLoading ? (
            <div className="skeleton-logo skeleton-logo-100 skeleton-logo-banner" />
        ) : (
        <Swiper
          pagination={{
            clickable: true,
          }}
          cssMode={true}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: true,
          }}
          modules={[Pagination, Autoplay]}
          className="myBanner"
          
        >
          {promos.map(promo => (
            <SwiperSlide key={promo.id}>
              <Link href={promo.link ? promo.link : `/promo/${encodeURIComponent(promo.title.replace(/\s+/g, '-').toLowerCase())}`} target="blank_">
                <div
                  className={styles.banner}
                  style={{ backgroundImage: `url(${storageUrl}/${promo.image})` }}
                >
                </div>
              </Link>

            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <div className={styles.section_1}>
          <div className={styles.heading_section}>
              <h2><font>Layanan</font> Kami</h2>
          </div>
          {isLoading ? (
            
            <div className={styles.slide_section_1}>
                <Swiper
                    dir="rtl"
                    navigation={true}
                    modules={[Navigation, Controller]}
                    className="mySwiper"
                    loop={true}
                    onSwiper={setSecondSwiper}
                    controller={{ control: firstSwiper }}
                >
                        <SwiperSlide>
                          <div className={styles.box_service_layout}>
                            <div className={`${styles.box_service}`}>
                              <div className="skeleton-logo skeleton-logo-100 skeleton-logo-service" />
                            </div>
                          </div>
                        </SwiperSlide>
                </Swiper>

                <Swiper
                    navigation={true}
                    modules={[Navigation, Controller]}
                    className="mySwiper mySwiperSecond"
                    loop={true}
                    onSwiper={setFirstSwiper}
                    controller={{ control: secondSwiper }}
                >
                        <SwiperSlide>
                          <div
                              className={`${styles.box_service_layout} ${styles.box_service_layout_second}`}
                            >
                            <div className={`${styles.box_service} ${styles.box_service_second}`}>
                              <div className="skeleton-logo skeleton-logo-100 skeleton-logo-service" />
                            </div>
                          </div>
                        </SwiperSlide>
                </Swiper>
            </div>
            ) : (
            <div className={styles.slide_section_1}>
                <Swiper
                    dir="rtl"
                    navigation={true}
                    modules={[Navigation, Controller]}
                    className="mySwiper"
                    loop={true}
                    onSwiper={setSecondSwiper}
                    controller={{ control: firstSwiper }}
                >
                    {firstHalf.map((service) => (
                        <SwiperSlide key={service.id}>
                            <div className={styles.box_service_layout}>
                                <div className={`${styles.box_service}`}>
                                    <div className={styles.box_service_content}>
                                        <h1>{service.name}</h1>
                                        <p>
                                          {serviceDetails[service.id]?.description.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '')}
                                        </p>

                                        <Link href={`/layanan/${encodeURIComponent(service.name.replace(/\s+/g, '-').toLowerCase())}`}>
                                            <button>Lihat Detail</button>
                                        </Link>
                                    </div>
                                    <div className={styles.box_service_image}>
                                        <img
                                            src={`${storageUrl}/${serviceDetails[service.id]?.image_2 || "placeholder.png"}`}
                                            alt={service.name}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <Swiper
                    navigation={true}
                    modules={[Navigation, Controller]}
                    className="mySwiper mySwiperSecond"
                    loop={true}
                    onSwiper={setFirstSwiper}
                    controller={{ control: secondSwiper }}
                >
                    {secondHalf.map((service) => (
                        <SwiperSlide key={service.id}>
                            <div
                                className={`${styles.box_service_layout} ${styles.box_service_layout_second}`}
                            >
                                <div className={`${styles.box_service} ${styles.box_service_second}`}>
                                    <div className={styles.box_service_content}>
                                        <h1>{serviceDetails[service.id]?.name || service.name}</h1>
                                        <p>
                                          {serviceDetails[service.id]?.description ? serviceDetails[service.id]?.description.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '') : "Loading..."}
                                        </p>

                                        <Link href={`/layanan/${encodeURIComponent(service.name.replace(/\s+/g, '-').toLowerCase())}`}>
                                            <button>Lihat Detail</button>
                                        </Link>
                                    </div>
                                    <div className={styles.box_service_image}>
                                        <img
                                            src={`${storageUrl}/${serviceDetails[service.id]?.image_2 ||
                                                "Loading..."}`}
                                            alt={service.name}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            )}
      </div>
      <div className={styles.section_2}>
        <div className={styles.heading_section}>
          <h2><font>Tentang</font> Kami</h2>
        </div>
        <div className={styles.section_2_text}>
          <img src="images/about_image.png" alt="Tentang NMW Aesthetic Clinic"/>
          <p>Adalah merek Aesthetic, Skincare, Dermatology and Wellness Clinic yang berbasis di Jakarta, Indonesia. Nama NMW Skin Care berasal dari pendiri perusahaan dr. Nataliani Mawardi - dengan kata Mawar yang menandakan dan mewakili Mawar yang secara universal disamakan dengan keindahan dan keanggunan, dua nilai inti yang dengan bangga diperjuangkan NMW dan diwakili oleh pelanggan di Indonesia.</p>
          <Link href={"/cabang"}><button>Lihat Cabang Kami</button></Link>
        </div>
      </div>
      <div className={styles.section_3}>
        <div className={styles.heading_section_3}>
          <div className={`${styles.heading_section} ${styles.heading_section_start}`}>
            <h2><font>Pendiri</font></h2>
            <p>dr. Nataliani Mawardi, dipl. CIBTAC</p>
          </div>
        </div>
        <div className={styles.section_3_box}>
          <div className={styles.section_3_content}>
            <p>Dr. Nataliani Mawardi adalah seorang pendiri dari klinik kecantikan NMW yang kini menjadi salah satu klinik kepercayaan artis top nasional dan masyarakat luas untuk perawatan wajah.</p>
            <p>Dr. Nataliani memiliki pendirian “give back to community”. Melihat kurangnya kepedulian ibu-ibu di pasar membuat Dr. Nataliani berinisiatif memberikan konsultasi untuk jaga kesehatan.</p>
            <Link href={'/achievment'}><button>Lihat Lebih Lanjut</button></Link>
          </div>
          <img src="images/dr_nataliani.png" alt="Dr. Nataliani Mawardi, dipl. CIBTAC" className={styles.section_3_image}/>
          <img src="images/blink_orange.svg" className={styles.section_icon_1} alt="Blink Material"/>
          <img src="images/blink_orange.svg" className={styles.section_icon_2} alt="Blink Material"/>
          <img src="images/blink_grey.svg" className={styles.section_icon_3} alt="Blink Material"/>
          <img src="images/blink_grey.svg" className={styles.section_icon_4} alt="Blink Material"/>
        </div>
      </div>
      <div className={styles.section_4}>
        <div className={styles.heading_section_4}>
          <div className={`${styles.heading_section} ${styles.heading_section_start}`}>
            <h2><font>Dokter</font> Kami</h2>
          </div>
        </div>
        <div className={styles.section_4_box}>
          <img src="images/nmw_dokter.png" alt="Dokter-dokter NMW Aesthetic Clinic" className={styles.our_dokter} />
          <img src="images/blink_orange.svg" className={styles.section_icon_5} alt="Blink Material" />
          <img src="images/blink_grey.svg" className={styles.section_icon_6} alt="Blink Material"/>
          <div className={styles.section_4_content}>
            <p>Dokter NMW Aesthetic klinik adalah dokter terpilih, terlatih secara profesional, dan terpercaya untuk melakukanbedah plastik, dermatologi, spesialis kulit dan kelamin dan perawatan kulit ekstetika.</p>
            <p>Dokter kami telah menjalani pelatihan ekstensif dan memiliki keahlian untuk memberikan hasil luar biasa sekaligus memastikan keselamatan pasien.</p>
            <Link href={'/dokter-kami'}><button>Lihat Lebih Lanjut</button></Link>
          </div>
        </div>
      </div>
      <div className={styles.article_section}>
          <div className={`${styles.heading_section}`}>
            <h2><font>Artikel</font></h2>
          </div>
          <div className={styles.article_layout}>
            {articles.map(article => {
              const tagsList = article.tags ? article.tags.split(',') : [];

              return(
                <div className={styles.article_box} key={article.id}> 
                  <div className={styles.article_image}>
                    {tagsList.length > 0 && (
                        <Link href={`/artikel/tag/${tagsList[0].trim()}`}>
                            <button className={styles.tag_article_img}>#{tagsList[0].trim()}</button>
                        </Link>
                    )}
                    <Link href={`/artikel/${encodeURIComponent(article.title.replace(/\s+/g, '-').toLowerCase())}`}>
                      <img src={article.image} alt={article.title}/>
                    </Link>
                  </div>
                  <div className={styles.article_content}>
                    <Link href={`/artikel/${encodeURIComponent(article.title.replace(/\s+/g, '-').toLowerCase())}`}>
                      <div className={styles.article_heading}>
                        <h1>{article.title}</h1>
                      </div>
                    </Link>
                    <span>Admin, {article.date}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <Link href={"/artikel"}><button className={styles.btn_more}>Lihat Lebih Banyak</button></Link>
      </div>
      <div className={styles.section_5}>
        <div className={styles.section_5_box}>
          <div className={styles.section_5_layout}>
            <h4>Metode Pembayaran</h4>
            <div className={styles.section_5_logo}>
              <img src="images/logo_payment.png" alt="Metode Pembayaran NMW Aesthetic Clinic"/>
            </div>
          </div>
          <div className={styles.section_5_layout}>
            <h4>Bank Transfer</h4>
            <div className={styles.section_5_logo}>
              <img src="images/bank_transfer.png" alt="Metode Pembayaran NMW Aesthetic Clinic"/>
            </div>
          </div>
          <div className={styles.section_5_layout}>
            <h4>Terdaftar dan diawasi oleh</h4>
            <div className={`${styles.section_5_logo} ${styles.section_5_logo_small}`}>
              <img src="images/legality.png" alt="Legalitas NMW Aesthetic Clinic"/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
