import profileData from './profile.json';

export type ProfileData = typeof profileData;

export const profile = profileData;

// Helper functions for common data access
export const getPersonalInfo = () => profile.personal;
export const getContactInfo = () => profile.contact;
export const getImages = () => profile.images;
export const getBranding = () => profile.branding;
export const getHomeData = () => profile.home;
export const getResumeData = () => profile.resume;
export const getWorkExperience = () => profile.workExperience;
export const getSkills = () => profile.skills;
export const getEngineering = () => profile.engineering;
export const getAIDevelopment = () => profile.aiDevelopment;
export const getCoverLetters = () => profile.coverLetters;
export const getSiteMetadata = () => profile.site.metadata;
export const getSiteDomain = () => profile.site.domain;
export const getNavigation = () => profile.site.navigation;
