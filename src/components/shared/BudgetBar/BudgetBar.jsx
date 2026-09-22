import React from 'react';
import { formatRubles } from '../../../shared/money';
import styles from './BudgetBar.module.css';

/**
 * Шкала бюджета объявления: сколько из выделенных денег уже начислено креаторам.
 * Креатору она отвечает на главный вопрос «а деньги ещё остались?», заказчику —
 * «сколько я уже отдал». Считаем всё в копейках, в рубли переводим только на показе.
 *
 * compact — вариант для карточки на доске: полоса тоньше, подписи в одну строку.
 */
const BudgetBar = ({ budgetKopecks, spentKopecks, compact = false }) => {
  const budget = Math.max(0, Number(budgetKopecks) || 0);
  const spent = Math.max(0, Number(spentKopecks) || 0);
  // Начисление на бэке режется остатком бюджета, но полосу всё равно ограничиваем
  // сотней процентов — иначе рассинхрон данных вылезет наружу кривой вёрсткой.
  const remaining = Math.max(0, budget - spent);
  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const exhausted = budget > 0 && remaining === 0;

  return (
    <div className={compact ? `${styles.wrap} ${styles.compact}` : styles.wrap}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label="Освоение бюджета объявления"
      >
        {/* Ширина полосы — единственное, что нельзя вынести в CSS-модуль. */}
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.legend}>
        <span className={styles.spent}>
          потрачено {formatRubles(spent)} из {formatRubles(budget)}
        </span>
        {exhausted ? (
          <span className={styles.exhausted}>бюджет исчерпан</span>
        ) : (
          <span className={styles.remaining}>осталось {formatRubles(remaining)}</span>
        )}
      </div>
    </div>
  );
};

export default BudgetBar;
