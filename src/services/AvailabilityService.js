import { supabase } from '../config/supabaseClient.js';
import { addMinutes, toISO } from '../utils/dates.js';

export const AvailabilityService = {
  async isFree(personalId, startISO, minutes){
    const endISO = toISO(addMinutes(new Date(startISO), minutes));
    const { data, error } = await supabase
      .from('citas')
      .select('id')
      .eq('personal_id', personalId)
      .or(`and(inicia_en.lte.${endISO},termina_en.gt.${startISO})`);
    if (error) throw error;
    return (data?.length ?? 0) === 0;
  }
};
