useEffect(() => {
  // Load plan
  fetch('/api/reading-plan')
    .then(res => res.json())
    .then(data => setPlan(data));

  // Preload first chapter's image
  fetch(`/api/generate-image?chapter=${currentChapter}`)
    .then(res => res.json())
    .then(data => setImage(data.url));
}, []);
