import { TextField, FormControl, CircularProgress } from "@mui/material";
import { useState, ChangeEventHandler, useCallback, useEffect } from "react";
import { UserSettings } from "../../db/entities";
import { useCurrentUser } from "../../hooks/UserContext";
import debounce from "just-debounce";

export interface BaseSettingsFieldOptions {
  label: string;
  helperText?: string | React.ReactNode;
  type?: 'number' | 'email' | 'password';
  settingsKey: keyof Omit<UserSettings, 'user'>;
  min?: number;
  max?: number;
}

export function UserSettingStatsMinWatched({ 
  helperText = <>In stats, only include items (e.g. an actor, a collection, etc) where you&apos;ve seen at least this number of movies for that item <b>(Note: this is not applied for &lsquo;Most Watched&rsquo; stats)</b></>
}: { helperText?: BaseSettingsFieldOptions['helperText'] }) {
  return (
    <BaseSettingsField
      type="number"
      settingsKey="statsMinWatched"
      label="Stats: Minimum Watched" 
      helperText={helperText}
      min={0}
    />
  );
}

export function UserSettingStatsMinCastOrder({
  helperText = <>In stats, only include ratings for movies where the given actor is billed at least this high <b>(Note: this only applies to actor stats)</b></>
}: { helperText?: BaseSettingsFieldOptions['helperText'] }) {
  return (
    <BaseSettingsField
      type="number"
      settingsKey="statsMinCastOrder"
      label="Stats: Lowest Cast Order" 
      helperText={helperText}
      min={1}
    />
  );
}

export function BaseSettingsField({ 
  label, 
  helperText, 
  type, 
  settingsKey,
  min,
  max
}: BaseSettingsFieldOptions) {
  const { user, updateSettings } = useCurrentUser();
  const [localValue, setLocalValue] = useState<any>(user?.settings && user?.settings[settingsKey]);
  const [isTempEmpty, setIsTempEmpty] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    setLocalValue(user?.settings ? user?.settings[settingsKey] : '');
  }, [user, settingsKey]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateSettings = useCallback(debounce(updateSettings, 200), [updateSettings]);
    
  if (!user || !user?.settings || typeof user?.settings[settingsKey] === "undefined") {
    return null;
  } 

  const handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = async (e) => {
    if (type === "number" && e.target.value === "") {
      setIsTempEmpty(true);
      return;
    }
    if (type === "number" && (typeof min === "number" || typeof max === "number")) {
      const value = Number(e.target.value);
      if (typeof min === "number" && value < min) {
        return;
      }
      if (typeof max === "number" && value > max) {
        return;
      }
    }
    setIsUpdating(true);
    setLocalValue(e.target.value);
    await debouncedUpdateSettings({ [settingsKey]: e.target.value });
    setIsTempEmpty(false);
    setIsUpdating(false);
  }

  return (
    <FormControl>
      <TextField 
        type={type} 
        value={isTempEmpty ? "" : localValue}
        disabled={isUpdating}
        label={label} 
        helperText={helperText}
        onChange={handleChange}
        InputProps={{
          endAdornment: isUpdating ? <CircularProgress /> : null
        }}
      />
    </FormControl>
  )
}