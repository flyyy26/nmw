import { useState, useEffect } from "react";
import styles from "@/styles/Dokter.module.css";
import banner from "@/styles/Banner.module.css";
import Link from "next/link";
import { HiArrowLongRight } from "react-icons/hi2";

export default function DokterKami() {
    const [doctors, setDoctors] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchData = async () => {
            let allDoctors = [];
            let currentPage = 1;
            let lastPage = 1;
    
            try {
                while (currentPage <= lastPage) {
                    const response = await fetch(`${baseUrl}/doctor?page=${currentPage}`);
                    const data = await response.json();
    
                    if (data && data.data && data.meta) {
                        // Hanya tambahkan dokter yang belum ada di allDoctors
                        const uniqueDoctors = data.data.filter(
                            (doctor) => !allDoctors.some((existingDoctor) => existingDoctor.id === doctor.id)
                        );
                        allDoctors = [...allDoctors, ...uniqueDoctors];
                        lastPage = data.meta.last_page;
                        currentPage++;
                    } else {
                        console.error("Invalid response data format:", data);
                        break;
                    }
                }
    
                setDoctors(allDoctors); // Simpan data yang sudah difilter
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };
    
        fetchData();
    }, []);

    const handleTabClick = (index) => {
        setActiveTab(index);
        setCurrentPage(1); // Reset to the first page when the tab changes
    };

    const filterDoctors = (tabIndex) => {
        switch (tabIndex) {
            case 0: // Semua Departemen
                return doctors;
            case 1: // Estetika
                return doctors.filter((doc) => doc.position === "Estetika");
            case 2: // Bedah Plastik
                return doctors.filter((doc) => doc.position === "Bedah Plastik");
            case 3: // Dermatologi
                return doctors.filter((doc) =>
                    ["Dermatologi", "Dermatologi & Spesialis Kulit dan Kelamin"].includes(doc.position)
                );
            default:
                return [];
        }
    };

    const filteredDoctors = filterDoctors(activeTab);

    const paginatedDoctors = filteredDoctors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        console.log("Filtered Doctors:", filteredDoctors);
        console.log("Current Page:", currentPage);
        console.log("Paginated Doctors:", paginatedDoctors);
    }, [filteredDoctors, currentPage]);

    return (
        <>
            <div className={banner.banner}>
                <img src="/images/dokter_banner.png" alt="Layanan NMW Clinic" />
            </div>
            <div className={styles.container}>
                <div className={styles.dokter_heading}>
                    <div className={`${styles.heading_section} ${styles.heading_section_start}`}>
                        <h1>
                            <font>Dokter</font> Kami
                        </h1>
                    </div>
                    <div className={styles.tabs}>
                        <button
                            className={activeTab === 0 ? styles.activeTab : styles.tab}
                            onClick={() => handleTabClick(0)}
                        >
                            Semua Departemen
                        </button>
                        <button
                            className={activeTab === 1 ? styles.activeTab : styles.tab}
                            onClick={() => handleTabClick(1)}
                        >
                            Estetika
                        </button>
                        <button
                            className={activeTab === 2 ? styles.activeTab : styles.tab}
                            onClick={() => handleTabClick(2)}
                        >
                            Bedah Plastik
                        </button>
                        <button
                            className={activeTab === 3 ? styles.activeTab : styles.tab}
                            onClick={() => handleTabClick(3)}
                        >
                            Dermatologi
                        </button>
                    </div>
                </div>
                <div className={styles.tabContent}>
                    <div className={styles.cabang_layout}>
                        {paginatedDoctors.length > 0 ? (
                            paginatedDoctors.map((doctor) => (
                                <div key={doctor.id} className={styles.cabang_box}>
                                    <div className={styles.cabang_box_image}>
                                        <img src={doctor.image} alt={doctor.name} />
                                    </div>
                                    <div className={styles.cabang_box_content}>
                                        <h1>
                                            <font>{doctor.name}</font>
                                        </h1>
                                        <span>{doctor.position}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No doctors available for this department.</p>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredDoctors.length > itemsPerPage && (
                        <div className={styles.article_pagination}>
                            {Array.from({ length: Math.ceil(filteredDoctors.length / itemsPerPage) }, (_, index) => (
                                <Link
                                    href="#"
                                    key={index + 1}
                                    className={currentPage === index + 1 ? styles.active_pagination : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(index + 1); // Ubah halaman aktif
                                    }}
                                >
                                    {index + 1}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
