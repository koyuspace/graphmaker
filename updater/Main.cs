using System.Diagnostics;
using System.IO.Compression;
using System.Net;
using System.Runtime.InteropServices;

namespace graphmakerupdate
{
  public partial class Main : Form
  {
    [DllImport("DwmApi")]
    private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, int[] attrValue, int attrSize);
    protected override void OnHandleCreated(EventArgs e)
    {
      if (DwmSetWindowAttribute(Handle, 19, new[] { 1 }, 4) != 0)
        DwmSetWindowAttribute(Handle, 20, new[] { 1 }, 4);
    }
    int version = 0;
    int latest = 0;
    public Main()
    {
      InitializeComponent();
      label1.Text = Properties.strings.checking;
      try
      {
        new HttpClient().GetStringAsync("https://updates.koyu.space").Wait();
      }
      catch
      {
        if (!File.Exists("Application.exe"))
        {
          this.Close();
          MessageBox.Show(Properties.strings.errortext, Properties.strings.error, MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        else
        {
          Process.Start("Application.exe");
          this.Close();
        }
      }
      try
      {
        label1.Text = Properties.strings.download;
        latest = Convert.ToInt32(new HttpClient().GetStringAsync("https://updates.koyu.space/graphmaker/latest").Result);
        if (File.Exists("version"))
        {
          version = Convert.ToInt32(File.ReadAllLines("version")[0]);
        }
        if (version == 0 || latest != version)
        {
          progressBar1.Style = ProgressBarStyle.Blocks;
#pragma warning disable SYSLIB0014
          WebClient webClient = new WebClient();
#pragma warning restore SYSLIB0014
          webClient.DownloadProgressChanged += (s, e) =>
          {
            label1.Text = Properties.strings.download + " (" + e.ProgressPercentage + "%)";
            progressBar1.Value = e.ProgressPercentage;
          };
          webClient.DownloadFileCompleted += (s, e) =>
          {
            progressBar1.Value = 100;
            label1.Text = Properties.strings.complete;
            Thread.Sleep(1000);
            progressBar1.Value = 0;
            progressBar1.Style = ProgressBarStyle.Marquee;
            label1.Text = Properties.strings.extract;
            ZipArchiveExtensions.ExtractToDirectory("release.zip", Directory.GetCurrentDirectory(), true);
            File.Delete("release.zip");
            Process.Start("Application.exe");
            this.Close();
          };
          webClient.DownloadFileAsync(new Uri("https://updates.koyu.space/graphmaker/release.zip"), "release.zip");
        } else
        {
          Process.Start("Application.exe");
          this.Close();
        }
      }
      catch
      {
        if (!File.Exists("Application.exe"))
        {
          this.Close();
          MessageBox.Show(Properties.strings.errortext, Properties.strings.error, MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        else
        {
          Process.Start("Application.exe");
          this.Close();
        }
      }
    }
  }
}
