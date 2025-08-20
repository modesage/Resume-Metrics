import { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);

    setStatusText("Uploading resume...");
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Error: Resume upload failed.");

    setStatusText("Converting to image for analysis...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file) {
      console.error("PDF conversion error:", imageFile.error);
      return setStatusText(
        `Error: Could not process resume. ${imageFile.error || ""}`
      );
    }

    setStatusText("Uploading processed image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Error: Image upload failed.");

    setStatusText("Preparing analysis data...");
    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Running AI analysis...");
    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );
    if (!feedback) return setStatusText("Error: Analysis failed.");

    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Analysis complete. Redirecting...");
    navigate(`/resume/${uuid}`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold">
            Upload Your Resume for AI-Powered Insights
          </h1>

          {isProcessing ? (
            <>
              <h2 className="text-gray-600 mt-2">{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                className="w-full max-w-md mx-auto mt-6"
              />
            </>
          ) : (
            <h2 className="text-gray-600 mt-2">
              Get instant ATS compatibility scoring and personalized
              recommendations to strengthen your application.
            </h2>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 mt-10 text-left"
            >
              <div className="form-div">
                <label htmlFor="company-name" className="font-medium">
                  Target Company
                </label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="e.g. Google"
                  id="company-name"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-title" className="font-medium">
                  Job Title
                </label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="e.g. Software Engineer"
                  id="job-title"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description" className="font-medium">
                  Job Description
                </label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Paste the job description here..."
                  id="job-description"
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader" className="font-medium">
                  Resume File
                </label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button
                className="primary-button w-fit self-center text-lg px-8"
                type="submit"
              >
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
export default Upload;
