export default {
  template: `<div> Welcome Manager <button @click='downloadProduct'>Download Products Data</button><span v-if='isWaiting'> Waiting... </span></div> `,
  data() {
    return {
      isWaiting: false,
    };
  },
  methods: {
    async downloadProduct() {
      this.isWaiting = true;
      try {
        const res = await fetch('/download-csv');
        if (!res.ok) {
          throw new Error('Failed to download CSV');
        }
        const data = await res.json();
        const taskId = data['task_id'];
    
        if (!taskId) {
          throw new Error('Task ID is missing or invalid');
        }
    
        const downloadUrl = `/get-csv/${taskId}`;
        const downloadRes = await fetch(downloadUrl);
        
        if (downloadRes.ok) {
          const blob = await downloadRes.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'products.csv'; // Set desired file name
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          throw new Error('Failed to download the file');
        }
    
        this.isWaiting = false;
      } catch (error) {
        console.error('Error downloading CSV:', error);
        this.isWaiting = false;
      }
    },
  },
}