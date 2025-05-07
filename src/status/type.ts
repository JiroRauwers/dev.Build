export interface StatusValue<T = any> {
  id: string;
  label: string;
  value: T; // the initial base value
  Rules: ruledef[]; // rules to be applied to the value
}

type ruledef =
  | string
  | {
      ruleId: string; // unique identifier for the rule
      params: string[]; // parameters for the rule
    };

export interface Rule {
  id: string; // unique identifier for the rule
  label: string; // human-readable label for the rule
  description: string; // detailed description of the rule
  type: "filter" | "transform"; // type of rule (filter or transform)
  condition: string; // condition to be applied (e.g., regex, function name)
  apply: (value: any) => boolean; // function to apply the rule to a value
  action: (value: any) => any; // function to take action based on the rule
}

export interface Achievement {
  id: string; // unique identifier for the achievement
  label: string; // human-readable label for the achievement
  description: string; // detailed description of the achievement
  statusId: string; // reference to the status this achievement is based on
  ruleId: string; // reference to the rule that determines when this achievement is unlocked
  unlocked: boolean; // whether the achievement is unlocked or not
  dateUnlocked?: Date; // date when the achievement was unlocked (optional)
}

// example of a status value configuration that will count the number of ts files
export const tsFileCount: StatusValue<number> = {
  id: "tsFileCount",
  label: "TypeScript Files",
  value: 0,
  Rules: ["tsFile", "count"],
};

const NodeProject: StatusValue = {
  id: "NodeProject",
  label: "Node Project",
  value: false,
  Rules: [
    {
      ruleId: "filterFilesByName",
      params: {
        includes: "**/*package.json",
        excludes: "**/node_modules/**",
      },
    },
  ],
};

const provisoryUsingTests: StatusValue = {
  id: "provisoryUsingTypes",
  label: "Provisory Using Types",
  value: false,
  Rules: [
    {
      ruleId: "filterFilesByName",
      params: ["*.test.(ts/tsx)", "*.spec.(ts/tsx)"],
    },
    "boolean",
  ],
};

export interface RuleLink<TIn, TOut> {
  ruleId: string;
  params?: any[];
}

const a = {
  displayedStatus: ["tsFileCount"],
  status: [
    {
      id: "tsFileCount",
      rules: ["filterTsFiles", "count"],
      initialValue: 0,
    },
    {
      id: "NodeProject",
      rules: [
        {
          ruleId: "filterFilesByName",
          params: {
            includes: "**/*package.json",
            excludes: "**/node_modules/**",
          },
        },
        "boolean",
      ],
    },
    {
      id: "provisoryUsingTypes",
      rules: [
        {
          ruleId: "filterFilesByName",
          params: ["*.test.(ts/tsx)", "*.spec.(ts/tsx)"],
        },
        {},
        "boolean",
      ],
    },
  ],
};

const b = {
  displayedStatus: ["tsFileCount"],
  cachedvalues: [
    {
      id: "testFiles",
      rules: [
        {
          ruleId: "filterFilesByName",
          params: ["*.test.ts", "*.spec.ts"],
        },
      ],
    },
    {
      id: "allTsFiles",
      rules: ["filterTsFiles"],
    },
  ],
  status: [
    {
      id: "tsFileCount",
      rules: [
        {
          ruleId: "getCachedValue",
          params: ["allTsFiles"],
        },
        "count",
      ],
      constraints: {
        any: [{ fileType: "typescript" }, { filename: "*.(ts|tsx)" }],
      },
      initialValue: 0,
    },
    {
      id: "NodeProject",
      rules: [
        {
          ruleId: "filterFilesByName",
          params: {
            includes: "**/*package.json",
            excludes: "**/node_modules/**",
          },
        },
        "boolean",
      ],
      initialValue: false,
      constraints: {
        filename: "*package.json",
      },
    },
    {
      id: "provisoryUsingTests",
      initialValue: false,
      rules: [
        {
          ruleId: "getCachedValue",
          params: ["testFiles"],
        },
        {
          ruleId: "checkNotEmpty",
        },
        "count",
        "boolean",
      ],
      constraints: {
        all: [
          { filename: "*.(ts|tsx)" },
          { filename: ["*.test.*", "*.specs.*"] },
        ],
      },
    },
  ],
};
