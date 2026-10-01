import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { errorMessage } from '../../shared/auth';
import { useDebouncedValue } from '../../shared/useDebouncedValue';
import { TOPIC_NAME_MIN, normalizeTopicName } from './campaignForm';

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_LIMIT = 8;

/**
 * Поиск тематик вне топа и добавление своей, если подходящей нет.
 * Добавить можно, только когда поиск по этому же запросу уже ответил и точного совпадения
 * в нём нет — иначе легко завести дубль, пока результаты ещё в пути.
 */
const useTopicSearch = (onPick) => {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState([]);
  const [resultsFor, setResultsFor] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const normalized = normalizeTopicName(query);
  const settled = normalizeTopicName(useDebouncedValue(query, SEARCH_DEBOUNCE_MS));

  useEffect(() => {
    if (!settled) {
      setResults([]);
      setResultsFor('');
      return undefined;
    }
    let cancelled = false;
    apiClient.api
      .searchCampaignTopics({ query: settled, limit: SEARCH_LIMIT })
      .then((res) => {
        if (cancelled) return;
        setResults(res.data ?? []);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setResults([]);
        setError(errorMessage(err, 'Не удалось найти тематики'));
      })
      .finally(() => {
        if (!cancelled) setResultsFor(settled);
      });
    return () => {
      cancelled = true;
    };
  }, [settled]);

  const active = Boolean(normalized);
  const searching = active && resultsFor !== normalized;
  const exact = searching
    ? null
    : results.find((topic) => normalizeTopicName(topic.description) === normalized) || null;
  const canAdd = active && !searching && !exact && !error && normalized.length >= TOPIC_NAME_MIN;

  const setQuery = (value) => {
    setQueryState(value);
    setError('');
  };

  const pick = (topic) => {
    onPick(topic);
    setQuery('');
  };

  const add = async () => {
    if (!canAdd || adding) return;
    setAdding(true);
    try {
      const res = await apiClient.api.createCampaignTopic({ name: query.trim() });
      pick(res.data);
      toast.success(`Тематика «${res.data.description}» выбрана`);
    } catch (err) {
      setError(errorMessage(err, 'Не удалось добавить тематику'));
    } finally {
      setAdding(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && query) {
      e.preventDefault();
      setQuery('');
      return;
    }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (exact) pick(exact);
    else add();
  };

  return { query, setQuery, active, searching, results, canAdd, adding, error, pick, add, onKeyDown };
};

export default useTopicSearch;
