'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import styles from './custom_select.module.css';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  placeholder?: string;
  error?: string;
  className?: string;
}

export default function CustomSelect({
  label,
  options,
  value,
  onChange,
  icon: Icon,
  placeholder = 'Select an option',
  error,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div 
        className={`${styles.selectWrapper} ${isOpen ? styles.open : ''} ${error ? styles.error : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.selectedContent}>
          {Icon && <Icon className={styles.icon} size={18} />}
          <span className={`${styles.selectedValue} ${!selectedOption ? styles.placeholder : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          className={`${styles.arrow} ${isOpen ? styles.arrowRotate : ''}`} 
          size={18} 
        />
      </div>

      {isOpen && (
        <ul className={styles.optionsList}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.optionItem} ${option.value === value ? styles.active : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
