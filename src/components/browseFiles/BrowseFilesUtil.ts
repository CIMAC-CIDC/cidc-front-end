import { File } from "../../model/File";

export function filterFiles(files: File[], selectedTrialIds: string[], selectedExperimentalStrategies: string[],
    selectedDataFormats: string[], searchFilter: string): File[] {

    return files.filter((file: File) => {
        let isTrialIdMatch = true;
        let isExperimentalStrategyMatch = true;
        let isDataFormatMatch = true;
        let isSearchFilterMatch = true;
        if (selectedTrialIds.length > 0) {
            isTrialIdMatch = selectedTrialIds.includes(file.trial_name);
        }
        if (selectedExperimentalStrategies.length > 0) {
            isExperimentalStrategyMatch = selectedExperimentalStrategies.includes(file.experimental_strategy);
        }
        if (selectedDataFormats.length > 0) {
            isDataFormatMatch = selectedDataFormats.includes(file.data_format);
        }
        if (searchFilter.length > 0) {
            isSearchFilterMatch = file.file_name.toLowerCase().includes(searchFilter.toLowerCase());
        }
        return isTrialIdMatch && isExperimentalStrategyMatch && isDataFormatMatch && isSearchFilterMatch;
    });
}

export function changeOption(selectedOptions: string[], option: string): string[] {
    if (selectedOptions.includes(option)) {
        return selectedOptions.filter((selectedOption: string) => {
            return selectedOption !== option;
        });
    } else {
        return [...selectedOptions, option];
    }
}
