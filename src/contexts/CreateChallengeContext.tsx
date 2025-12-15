import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CreateChallengeData {
  // Q1
  category: 'HEALTH' | 'STUDY' | 'HOBBY' | 'CAREER' | 'HABIT' | '';
  isPublic: boolean | null;

  // Q2
  challengeName: string;
  oneLiner: string;
  verificationMethod: 'photo' | 'text' | '';
  verificationDays: string[];
  startTime: { period: 'AM' | 'PM'; hour: string; minute: string } | null;
  endTime: { period: 'AM' | 'PM'; hour: string; minute: string } | null;
  maxParticipants: number;
  challengeRules: string;
  thumbnailImageUri: string | null;
  imageKey: string | null; // S3 업로드 후 받은 키

  // Q3
  startDate: Date | null;

  // Q4
  isObserverModeEnabled: boolean;
  password: string;
}

interface CreateChallengeContextType {
  data: CreateChallengeData;
  updateData: (updates: Partial<CreateChallengeData>) => void;
  resetData: () => void;
}

const initialData: CreateChallengeData = {
  category: '',
  isPublic: null,
  challengeName: '',
  oneLiner: '',
  verificationMethod: '',
  verificationDays: [],
  startTime: null,
  endTime: null,
  maxParticipants: 0,
  challengeRules: '',
  thumbnailImageUri: null,
  imageKey: null,
  startDate: null,
  isObserverModeEnabled: false,
  password: '',
};

const CreateChallengeContext = createContext<CreateChallengeContextType | undefined>(undefined);

export const CreateChallengeProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<CreateChallengeData>(initialData);

  const updateData = (updates: Partial<CreateChallengeData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(initialData);
  };

  return (
    <CreateChallengeContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </CreateChallengeContext.Provider>
  );
};

export const useCreateChallenge = () => {
  const context = useContext(CreateChallengeContext);
  if (!context) {
    throw new Error('useCreateChallenge must be used within CreateChallengeProvider');
  }
  return context;
};
