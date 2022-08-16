import { TextField, FormControl, CircularProgress } from "@mui/material";
import { useState, ChangeEventHandler, FocusEventHandler, KeyboardEventHandler } from "react";
import { UserSettings } from "../../db/entities";
import { useCurrentUser } from "../../hooks/UserContext";

export interface BaseSettingsFieldOptions {
  label: string;
  helperText?: string | React.ReactNode;
  type?: 'number' | 'email' | 'password';
  settingsKey: keyof Omit<UserSettings, 'user'>;
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
    />
  );
}

export function BaseSettingsField({ 
  label, 
  helperText, 
  type, 
  settingsKey
}: BaseSettingsFieldOptions) {
  const { user, updateSettings } = useCurrentUser();
  const [isTempEmpty, setIsTempEmpty] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
    
  if (!user || typeof user.settings[settingsKey] === "undefined") {
    return null;
  } 

  const handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = async (e) => {
    if (type === "number" && e.target.value === "") {
      setIsTempEmpty(true);
      return;
    }
    setIsUpdating(true);
    await updateSettings({ [settingsKey]: e.target.value });
    setIsTempEmpty(false);
    setIsUpdating(false);
  }

  return (
    <FormControl>
      <TextField 
        type={type} 
        value={isTempEmpty ? "" : user.settings[settingsKey]}
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