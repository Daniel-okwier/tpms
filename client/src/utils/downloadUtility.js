
export const handleFileDownload = (arrayBuffer, defaultFilename) => {
  try {
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    
    link.setAttribute('download', defaultFilename); 
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    return { success: true, message: 'File download started.' };
  } catch (error) {
    console.error('Download Utility Error:', error);
    return { success: false, message: 'Could not process file for download.' };
  }
};