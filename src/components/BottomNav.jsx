import React from 'react';
import { Home, Search, BookOpen, List, User } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'diary', label: 'Diário', icon: BookOpen },
    { id: 'lists', label: 'Listas', icon: List },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
