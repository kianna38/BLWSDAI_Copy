export const formatDate = (date) => {
    if (!date) return 'N/A'; // If no date is provided, return 'N/A'
    const formattedDate = new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Adjust time format to 12-hour clock with AM/PM
    });

    return formattedDate;
};


export const formatDateMonthYear = (date) => {
    if (!date) return 'N/A'; // If no date is provided, return 'N/A'
    const formattedDate = new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        hour12: true, // Adjust time format to 12-hour clock with AM/PM
    });

    return formattedDate;
};

