import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InfoLayout from './InfoLayout';
import NotFound from '../NotFound/NotFound';
import styles from './Info.module.css';

// Адрес страницы — имя файла: src/content/info/terms.md открывается на /info/terms.
// Каждый документ — отдельный чанк, чтобы тексты не утяжеляли основной бандл.
const PAGES = import.meta.glob('../../content/info/*.md');

const DocumentPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const load = PAGES[`../../content/info/${slug}.md`];
  const [page, setPage] = useState({ slug: null, html: '', failed: false });

  useEffect(() => {
    if (!load) {
      return undefined;
    }
    let active = true;
    load()
      .then((module) => {
        if (active) {
          setPage({ slug, html: module.default, failed: false });
        }
      })
      .catch(() => {
        if (active) {
          setPage({ slug, html: '', failed: true });
        }
      });
    return () => {
      active = false;
    };
  }, [load, slug]);

  if (!load) {
    return <NotFound />;
  }

  // Внутренние ссылки из текста документа ведём через роутер, без перезагрузки страницы.
  const handleClick = (event) => {
    const href = event.target.closest('a')?.getAttribute('href');
    if (href?.startsWith('/') && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      navigate(href);
    }
  };

  const isCurrent = page.slug === slug;

  return (
    <InfoLayout>
      {isCurrent && page.failed && (
        <p className={styles.text}>Не удалось загрузить документ. Обновите страницу.</p>
      )}
      {isCurrent && !page.failed && (
        // Текст приходит из файлов репозитория, пользовательского ввода здесь нет.
        <div
          className={styles.document}
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      )}
    </InfoLayout>
  );
};

export default DocumentPage;
