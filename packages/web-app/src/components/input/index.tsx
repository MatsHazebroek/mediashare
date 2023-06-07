import { useRef, useState } from "react";

type inputProps = {
  label: string;
  initialValue?: string;
  maxLength?: number;
  errorMessage?: string;
  isRequired?: boolean;
};

const Index: React.FC<inputProps> = ({
  label,
  initialValue = "",
  maxLength,
  errorMessage,
  isRequired = true,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setIsEmpty(false);
  };

  const handleFocusBlur = (isFocused: boolean) => {
    setIsFocused(isFocused);
    if (!isFocused && value.length === 0) {
      setIsEmpty(true);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  return (
    <>
      <div
        className={`mb-[15px] flex items-center gap-5 ${
          isFocused ? "focus" : ""
        }`}
        onClick={handleClick}
      >
        <div
          className={`w-full rounded-[4px] border p-2 ${
            isEmpty && errorMessage ? "border-red-500" : ""
          }`}
        >
          <div className="flex justify-between">
            <span className="block text-sm">{label}</span>
            {isFocused && maxLength && (
              <span className="text-sm text-gray-400">
                {value.length}/{maxLength}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              ref={inputRef}
              className={`w-full bg-transparent py-1 outline-none ${
                isEmpty && errorMessage ? "text-red-500" : ""
              }`}
              defaultValue={value}
              maxLength={maxLength}
              onChange={handleChange}
              onFocus={() => handleFocusBlur(true)}
              onBlur={() => handleFocusBlur(false)}
            />
          </div>
        </div>
        {isRequired && isEmpty && errorMessage && (
          <span className="text-sm text-red-500">{errorMessage}</span>
        )}
        {maxLength && value.length === maxLength && (
          <span className="text-sm text-red-500">
            Je hebt het maximale aantal tekens bereikt
          </span>
        )}
      </div>
    </>
  );
};

export default Index;
