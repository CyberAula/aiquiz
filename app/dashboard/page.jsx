'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';
import Footer from "../components/ui/Footer";
import Logo from "../components/ui/Logo";
import { useTranslation } from "react-i18next";


const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      
      if (data.success) {
        setSubjects(data.subjects);
      } else {
        setError('Error loading subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Error loading subjects');
    } finally {
      setLoading(false);
    }
  };

    
    if (loading) {
        return (
            <div className='animated-bg min-h-screen grid place-items-center'>
                <div className='border rounded border-white/0 '>
                    <Logo/>
                    <h2 className='text-center text-lg md:text-xl mt-2 custom-gradient q-animate-gradient mb-12'>
                        {t('common.loading')}
                    </h2>
                </div>
                <Footer/>
            </div>  
        );
    }

    if (error) {
        return (
            <div className='animated-bg min-h-screen grid place-items-center'>
                <div className='border rounded border-white/0 '>
                    <Logo/>
                    <h2 className='text-center text-lg md:text-xl mt-2 text-red-600 mb-12'>
                        {error}
                    </h2>
                </div>
                <Footer/>
            </div>  
        );
    }

    return (
        <div className='animated-bg min-h-screen grid place-items-center'>
        <div className='border rounded border-white/0 '>
         <Logo/>
          <h2 className='text-center text-lg md:text-xl mt-2  custom-gradient q-animate-gradient mb-12'>
          {t('dashboard.choose')}
          </h2>
          <div className='grid grid-cols-4 mt-3 gap-3'>
            {subjects.map((subject) => (
              <Link  
                key={subject._id}
                className="subject-button" 
                id={subject.acronym.toLowerCase()} 
                href={{pathname: `/dashboard/subject/${subject.acronym}`}}
              > 
                <p>{subject.name}</p>
                <p className="subject-acronym">{subject.acronym}</p>
              </Link>
            ))}
          </div>
        </div>
        <Footer/>
      </div>  
    )
}

export default DashboardPage;