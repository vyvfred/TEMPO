import { useAppState } from '@/store/AppContext';

export function useAppData() {
  const { state, dispatch } = useAppState();

  return {
    personnel: state.personnel,
    besoins: state.besoins,
    activites: state.activites,
    currentAgence: state.currentAgence,
    selectedDate: state.selectedDate,
    selectedBureauId: state.selectedBureauId,
    user: state.user,
    dispatch,
  };
}