// This utility is designed to parse the two specific CSV formats provided by eBay for categories.

const parseL1ToL6Format = (csvText: string): string[] => {
    const lines = csvText.split('\n').slice(1); // Skip header
    const categories: string[] = [];

    for (const line of lines) {
        if (!line.trim()) continue;
        const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
        const categoryPath = columns.slice(0, 6).filter(Boolean).join(' > ');
        if (categoryPath) {
            categories.push(categoryPath);
        }
    }
    return categories;
};

const parseColumnarFormat = (csvText: string): string[] => {
    const lines = csvText.split('\n');
    const categories: string[] = [];
    let currentPath: string[] = [];
    
    // Find the header row to determine column indices
    const headerRowIndex = lines.findIndex(line => line.startsWith('"Category Name"'));
    if (headerRowIndex === -1) return [];
    
    const relevantLines = lines.slice(headerRowIndex + 1);

    for (const line of relevantLines) {
        if (!line.trim() || line.startsWith(',')) continue;
        
        const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
        
        // Find the depth of the current category
        let depth = -1;
        for (let i = 0; i < 6; i++) { // Check first 6 columns
            if (columns[i] && columns[i] !== '-') {
                depth = i;
                break;
            }
        }

        if (depth !== -1) {
            const categoryName = columns[depth];
            currentPath = currentPath.slice(0, depth);
            currentPath.push(categoryName);
            categories.push(currentPath.join(' > '));
        }
    }
    return categories;
};


export const parseEBayCategoriesCSV = (csvContents: string[]): string[] => {
    let allCategories: string[] = [];

    for (const content of csvContents) {
        // Simple heuristic to detect which format we're dealing with
        if (content.includes('"L1","L2","L3"')) {
            allCategories = allCategories.concat(parseL1ToL6Format(content));
        } else if (content.includes('"Category Name"')) {
            allCategories = allCategories.concat(parseColumnarFormat(content));
        }
    }
    
    // Remove duplicates
    return Array.from(new Set(allCategories));
};
