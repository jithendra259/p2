"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback, memo } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { CgProfile } from 'react-icons/cg';
import SearchBar from './searchbar';

// Memoize the menu items to prevent unnecessary re-renders
const MenuItems = memo(({ isActive }) => (
  <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700 " >
    <li>
      <Link
        href="/dashboard"
        className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
        aria-current="page"
      >
        Home
      </Link>
    </li>
    <li>
      <Link
        href="/ranking"
        className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
      >
        Ranking
      </Link>
    </li>
    <li>
      <Link
        href="/historic-ranking"
        className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
      >
        Historic Ranking
      </Link>
    </li>
  </ul>
));
MenuItems.displayName = 'MenuItems';

// Memoize the user dropdown component
const UserDropdown = memo(({ session, onSignOut }) => (
  <div
    className="absolute right-0 mt-12 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 z-50"
    style={{ top: "20px" }}
    id="user-dropdown"
  >
    <div className="px-4 py-3">
      <span className="block text-sm text-gray-900 dark:text-white">
        <span className="font-bold">{session?.user?.name}</span>
      </span>
      <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
        <span className="font-bold">{session?.user?.email}</span>
      </span>
    </div>
    <ul className="py-2" aria-labelledby="user-menu-button">
      <li>
        <Link
          href="/rankpage1"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
        >
          Dashboard
        </Link>
      </li>
      <li>
        <Link
          href="/settings"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
        >
          Settings
        </Link>
      </li>
      <li>
        <button
          onClick={onSignOut}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white w-full text-left"
        >
          Sign out
        </button>
      </li>
    </ul>
  </div>
));
UserDropdown.displayName = 'UserDropdown';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { data: session } = useSession();

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const toggleNavbar = useCallback(() => {
    setNavbarOpen(prev => !prev);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('user-dropdown');
      const button = document.getElementById('user-menu-button');
      if (
        dropdown && 
        !dropdown.contains(event.target) && 
        button && 
        !button.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className='w-full'>
      <nav className="bg-white border-gray-200 dark:bg-gray-900 mx-auto w-full border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="flex flex-wrap items-center justify-between p-4">

          <SearchBar />

          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative">
            <button
              type="button"
              className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              id="user-menu-button"
              aria-expanded={dropdownOpen}
              onClick={toggleDropdown}
            >
              <span className="sr-only">Open user menu</span>
              <CgProfile className="w-8 h-8 rounded-full text-white" />
            </button>
            {isClient && dropdownOpen && (
              <UserDropdown session={session} onSignOut={handleSignOut} />
            )}
            <button
              data-collapse-toggle="navbar-user"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-user"
              aria-expanded={navbarOpen}
              onClick={toggleNavbar}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className={`right-0 justify-between ${
              navbarOpen ? "block" : "hidden"
            } ${navbarOpen ? "absolute" : ""} divide-y md:flex md:w-auto md:order-1 z-50`}
            style={{ top: "45px" }}
            id="navbar-user"
          >
            <MenuItems isActive={navbarOpen} />
          </div>
        </div>
      </nav>
    </div>
  );
}
