import React from 'react';

const languages = [
  { code: 'gb', name: 'English' },
  { code: 'my', name: 'Malay' },
  { code: 'cn', name: '简体中文' },
  { code: 'hk', name: '繁體中文' },
  { code: 'gr', name: 'Ελληνικά' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ru', name: 'Русский' },
  { code: 'id', name: 'Indonesia' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'se', name: 'Svenska' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pl', name: 'Polski' },
  { code: 'sa', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'kr', name: '한국어' },
  { code: 'pt', name: 'Português' },
  { code: 'vn', name: 'Tiếng Việt' },
  { code: 'th', name: 'ภาษาไทย' },
  { code: 'ph', name: 'Filipino' },
  { code: 'nl', name: 'Dutch' },
  { code: 'cz', name: 'Česky' },
  { code: 'bd', name: 'বাংলা' },
  { code: 'pk', name: 'اردو' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'in', name: 'हिंदी' },
  { code: 'lk', name: 'සිंහල' },
  { code: 'uz', name: 'O\'zbekcha' },
  { code: 'mn', name: 'Монгол' },
];

function LanguageSelector() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState(languages.find(l => l.code === 'vn'));
  
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <div className="lang-selector-container" ref={menuRef}>
      <div className="lang-selector" onClick={() => setIsOpen(!isOpen)}>
        <img 
          src={`https://flagcdn.com/w20/${selectedLang.code}.png`} 
          alt={selectedLang.code} 
          className="flag-icon"
        />
        <span>{selectedLang.name}</span>
        <span className="dropdown-icon">▼</span>
      </div>

      {isOpen && (
        <div className="lang-dropdown-menu">
          {languages.map((lang, idx) => (
            <div 
              key={idx} 
              className={`lang-item ${lang.code === selectedLang.code ? 'selected' : ''}`}
              onClick={() => {
                setSelectedLang(lang);
                setIsOpen(false);
              }}
            >
              <img 
                src={`https://flagcdn.com/w20/${lang.code}.png`} 
                alt={lang.code} 
                className="lang-item-flag"
              />
              <span className="lang-item-name">{lang.name}</span>
              {lang.code === selectedLang.code && (
                <span className="lang-check-icon">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
