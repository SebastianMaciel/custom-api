import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RoutesResponse } from "@/RouteManager/RouteManager";
import { faker } from "@faker-js/faker";
import axios from "axios";
import {
  Check,
  ChevronsUpDown,
  ListTree,
  Lock,
  LockOpen,
  TextCursorInput,
  Trash,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";

function useClickAway(cb: (e: Event) => void) {
  const ref = useRef(null);
  const refCb = useRef(cb);

  useLayoutEffect(() => {
    refCb.current = cb;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const element = ref.current;
      if (element && !(element as HTMLElement).contains(e.target as Node)) {
        refCb.current(e);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return ref;
}

const camelCase = (str: string) =>
  str
    .replace(/\s(.)/g, ($1) => $1.toUpperCase())
    .replace(/\s/g, "")
    .replace(/^(.)/, ($1) => $1.toLowerCase());

export type RoutesData = {
  id: number;
  name: string;
};

type Props = {
  selectedRoute: RoutesResponse;
};

type Action =
  | {
      type: "ADD_FIELD";
      payload: {
        id: string;
        name: string;
        method: string;
        value: string;
        open: boolean;
      };
    }
  | {
      type: "EDIT_FIELD";
      payload: { id: string; name?: string; method?: string; value?: string };
    }
  | { type: "REMOVE_FIELD"; payload: { id: string } }
  | { type: "CLEAR_FIELDS" };

const Routes = ({ selectedRoute }: Props) => {
  const [isValidToUpdate, setIsValidToUpdate] = useState(false);
  const [isRemoveEnabled, setIsRemoveEnabled] = useState(false);

  const ref = useClickAway(() => {
    setIsRemoveEnabled(false);
  });

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data } = await axios.get<RoutesResponse[]>(
          `http://localhost:3000/routes`
        );

        const routeConfig = data.find((route) => route.id === selectedRoute.id);

        // Response is {"a":"internet.username","b":"person.fullName","c":"internet.email"}
        // map it as [{name: "a", method: "internet.username"}, {name: "b", method: "person.fullName"}, {name: "c", method: "internet.email"}]
        const formattedConfig = JSON.parse(routeConfig?.responseConfig || "{}");

        if (formattedConfig) {
          // clear all fields
          dispatch({ type: "CLEAR_FIELDS" });

          const formattedFields = Object.entries(formattedConfig).map(
            ([name, method]) => {
              return {
                id: Math.random().toString(36).substring(7),
                name,
                method: method as string,
                value: name,
                open: false,
              };
            }
          );

          // add every field to the formFields state
          formattedFields.forEach((field) => {
            dispatch({ type: "ADD_FIELD", payload: field });
          });
        }
      } catch (error) {
        dispatch({ type: "CLEAR_FIELDS" });
        console.error("Error fetching routes:", error);
      }
    };

    fetchRoutes();
  }, [selectedRoute]);

  const getFakerMethodsByCategory = (): {
    category: string;
    methods: string[];
  }[] => {
    const categories: { category: string; methods: string[] }[] = [];

    for (const category in faker) {
      if (typeof faker[category as keyof typeof faker] === "object") {
        const methods: string[] = [];

        for (const method in faker[category as keyof typeof faker]) {
          if (typeof faker[category][method] === "function") {
            methods.push(method);
          }
        }

        if (methods.length > 0) {
          categories.push({ category, methods });
        }
      }
    }

    return categories;
  };

  const fakerCategories = getFakerMethodsByCategory();
  const alphabethicalCategories = fakerCategories.sort((a, b) =>
    a.category.localeCompare(b.category)
  );

  const capitalizedMethods = alphabethicalCategories.map((category) => ({
    category: category.category,
    methods: category.methods.map((method) =>
      method
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
    ),
  }));

  const categories = capitalizedMethods.filter(
    (category) =>
      category.category !== "_randomizer" &&
      category.category !== "helpers" &&
      category.category !== "airline"
  );

  const unifiedMethods = categories.flatMap((category) =>
    category.methods.map((method) => ({
      label: `${category.category.toUpperCase()} | ${method}`,
      value: `${category.category}.${camelCase(method)}`,
    }))
  );

  const formFieldsReducer = (
    state: {
      id: string;
      name: string;
      method: string;
      value: string;
      open: boolean;
    }[],
    action: Action
  ) => {
    switch (action.type) {
      case "ADD_FIELD":
        return [...state, action.payload!];

      case "EDIT_FIELD":
        return state.map((field) =>
          field.id === action.payload?.id
            ? { ...field, ...action.payload }
            : field
        );

      case "REMOVE_FIELD":
        return state.filter((field) => field.id !== action.payload?.id);

      case "CLEAR_FIELDS":
        return [];

      default:
        return state;
    }
  };

  const [formFields, dispatch] = useReducer(formFieldsReducer, []);

  const addField = (name: string, method: string) => {
    const randomId = Math.random().toString(36).substring(7);

    dispatch({
      type: "ADD_FIELD",
      payload: {
        id: randomId,
        name,
        method,
        value: "",
        open: false,
      },
    });
  };

  const editField = (
    id: string,
    name?: string,
    method?: string,
    value?: string,
    open?: boolean
  ) => {
    dispatch({
      type: "EDIT_FIELD",
      payload: {
        id,
        ...(name !== undefined && { name }),
        ...(method !== undefined && { method }),
        ...(value !== undefined && { value }),
        ...(open !== undefined && { open }),
      },
    });
  };

  const removeField = (id: string) => {
    dispatch({
      type: "REMOVE_FIELD",
      payload: {
        id,
      },
    });
  };

  interface FormField {
    id: string;
    name: string;
    method: string;
    value: string;
    open: boolean;
  }

  interface FormattedJsonConfig {
    [key: string]: string;
  }

  const formattedJsonConfig: FormattedJsonConfig = formFields.reduce(
    (acc: FormattedJsonConfig, field: FormField) => {
      acc[field.name] = field.method;
      return acc;
    },
    {} as FormattedJsonConfig
  );

  const handleUpdate = async () => {
    const routeConfig = {
      path: selectedRoute.path,
      method: selectedRoute.method,
      responseConfig: JSON.stringify(formattedJsonConfig),
      seedConfig: JSON.stringify(formattedJsonConfig),
    };

    try {
      await axios.put(
        `http://localhost:3000/api/${selectedRoute.id}`,
        routeConfig
      );
    } catch (error) {
      console.error("Error generating data:", error);
    }
  };

  // useEffect and function to check: if some of the fields or methods are empty, disable the update button
  useEffect(() => {
    const hasEmptyFields = formFields.some(
      (field) => !field.name || !field.method
    );

    setIsValidToUpdate(!hasEmptyFields);
  }, [formFields]);

  return (
    <div className='p-4 pl-8 w-full max-w-[920px]'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-semibold'>Route: {selectedRoute.path}</h1>

        {/* remove route */}
        <div className='flex'>
          <div
            ref={ref}
            className='inline-flex -space-x-px divide-x rounded-lg shadow-sm divide-primary-foreground/30 shadow-black/5 rtl:space-x-reverse'
          >
            <Button
              className='rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10'
              size='icon'
              variant={isRemoveEnabled ? "secondary" : "destructive"}
              aria-label='QR code'
              onClick={() => setIsRemoveEnabled(!isRemoveEnabled)}
            >
              {!isRemoveEnabled && (
                <Lock
                  size={16}
                  strokeWidth={2}
                  aria-hidden='true'
                />
              )}

              {isRemoveEnabled && (
                <LockOpen
                  size={16}
                  strokeWidth={2}
                  aria-hidden='true'
                />
              )}
            </Button>
            <Button
              disabled={!isRemoveEnabled}
              className='rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10'
              variant={isRemoveEnabled ? "destructive" : "secondary"}
              onClick={() => {
                axios.delete(`http://localhost:3000/api/${selectedRoute.id}`);
              }}
            >
              Remove route
            </Button>
          </div>
        </div>
      </div>

      <h1 className='mt-8 mb-4 text-xl font-semibold'>Configure response</h1>

      <div className='flex flex-col space-y-4'>
        {formFields.length > 0 &&
          formFields.map((field: FormField) => {
            return (
              <div
                key={field.id}
                className='flex items-center w-full space-x-2'
              >
                <div className='flex flex-col space-y-2 max-w-[300px] w-full'>
                  <Label htmlFor={`name-${field.id}`}>Field name</Label>
                  <Input
                    type='text'
                    onChange={(e) =>
                      editField(field.id, e.target.value, field.method)
                    }
                    value={field.name}
                  />
                </div>

                <div className='flex flex-col space-y-2 max-w-[300px] w-full'>
                  <Label htmlFor={`method-${field.id}`}>Method</Label>

                  <Popover
                    open={field.open}
                    onOpenChange={(isOpen) =>
                      editField(
                        field.id,
                        field.name,
                        field.method,
                        field.value,
                        isOpen
                      )
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant='secondary'
                        role='combobox'
                        aria-expanded={field.open}
                        className='max-w-[300px] justify-between'
                      >
                        {field.value
                          ? unifiedMethods.find(
                              (method) => method.value === field.method
                            )?.label
                          : "Select method..."}
                        <ChevronsUpDown className='opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0'>
                      <Command>
                        <CommandInput placeholder='Search method...' />
                        <CommandList>
                          <CommandEmpty>No method found.</CommandEmpty>

                          <CommandGroup>
                            {unifiedMethods.map((method) => (
                              <CommandItem
                                key={method.value}
                                value={method.value}
                                onSelect={(currentValue) => {
                                  const newValue =
                                    currentValue === field.value
                                      ? ""
                                      : currentValue;

                                  editField(
                                    field.id,
                                    field.name,
                                    method.value,
                                    newValue,
                                    false
                                  );
                                }}
                              >
                                {method.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    field.value === method.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* // if more than one field, show remove button */}
                {formFields.length > 1 && (
                  <Button
                    variant='outline'
                    type='button'
                    className='self-end border-red-500'
                    onClick={() => removeField(field.id)}
                  >
                    <Trash />
                    Remove
                  </Button>
                )}
              </div>
            );
          })}

        {!formFields.length && (
          <Card className='w-full max-w-[300px] py-6'>
            <p className='text-center'>No fields added yet.</p>
          </Card>
        )}

        <div className='flex space-x-2'>
          <Button
            variant='secondary'
            type='button'
            className='max-w-[300px] w-full mt-4'
            onClick={() => addField("", "")}
          >
            <TextCursorInput />
            Add new field
          </Button>
          <Button
            variant='secondary'
            type='button'
            className='max-w-[300px] w-full mt-4'
            onClick={() => addField("", "")}
          >
            <ListTree />
            Add new subkey
          </Button>
        </div>
      </div>

      {Object.keys(formattedJsonConfig).length > 0 && (
        <>
          <h1 className='mt-8 text-xl font-semibold'>Response example</h1>

          <SyntaxHighlighter
            language='json'
            style={nord}
          >
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(formattedJsonConfig).map(([key, value]) => {
                  const [category, method] = value.split(".");
                  if (!category || !method) return [key, null];
                  return [
                    key,
                    (
                      faker as unknown as Record<
                        string,
                        Record<string, () => unknown>
                      >
                    )[category]?.[method]?.() ?? null,
                  ];
                })
              ),
              null,
              2
            )}
          </SyntaxHighlighter>
        </>
      )}

      {/* <h1 className='mt-8 text-xl font-semibold'>JSON Configuration</h1> */}

      {/* <textarea
        value={JSON.stringify(formattedJsonConfig, null, 2)}
        onChange={(e) => setJsonFormConfig(e.target.value)}
        rows={10}
        className='w-full p-2 mt-4 border rounded'
      ></textarea> */}

      {Object.keys(formattedJsonConfig).length > 0 && (
        <Button
          onClick={handleUpdate}
          className='w-full mt-4 ml-auto'
          variant='default'
          disabled={!isValidToUpdate}
        >
          Update route
        </Button>
      )}
      {/* 
      <h1 className='mt-8 text-xl font-semibold'>Generated Data</h1>

      <SyntaxHighlighter
        language='json'
        style={nord}
      >
        {JSON.stringify(responseData, null, 2)}
      </SyntaxHighlighter> */}
    </div>
  );
};

export default Routes;
