import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { useParams } from 'react-router-dom';
import CommentSection from '../Preview/CommentSection/CommentSection';
import Episodes from '../Preview/SeasonSection/Episodes/Episodes';
import ItemDetails from './Detail/ItemDetails';

const WatchPage = () => {
    const userId = localStorage.getItem('id');
    const { id } = useParams();
    const [videoUrl, setVideoUrl] = useState('');
    const [videoType, setVideoType] = useState('');
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    console.log(videoUrl)

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        const fetchVideoData = async () => {
            try {
                setVideoUrl('');

                const response = await fetch(`http://localhost:2811/movie/video?id=${id}`);
                const data = await response.json();
                if (data && data.data) {
                    setVideoUrl(data.data.video_url);
                    setVideoType(data.data.type);
                }
            } catch (error) {
                console.error('Error fetching video data:', error);
                setVideoUrl('https://www.youtube.com/embed/bXykENe1wwY');
                setVideoType('');
            }
        };

        fetchVideoData();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [id]);

    const videoWidth = dimensions.width * 0.8;
    const videoHeight = dimensions.height * 0.8;

    const handleMarkAsWatched = async () => {
        try {
            const response = await fetch('http://localhost:2811/movie/watched', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movieId: id,
                    userId: userId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark movie as watched');
            }

            const result = await response.json();
            console.log('Movie marked as watched:', result);
            alert('Movie marked as watched!');
        } catch (error) {
            console.error('Error marking as watched:', error);
        }
    };

    return (
        <>
            <div className={styles.container}>
                {videoUrl && (
                    <iframe
                        width={videoWidth}
                        height={videoHeight}
                        src={videoUrl}
                        title="Video Player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                )}
            </div>
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
                {userId && (
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007BFF',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '20px'
                        }}
                        onClick={handleMarkAsWatched}
                    >
                        Mark as Watched
                    </button>
                )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: '3' }}>
                    <ItemDetails id={id} />
                    <CommentSection id={id} title="Comments" />
                </div>
                {
                    videoType.toLowerCase() === 'episode' &&
                    <div style={{ flex: '1' }}>
                        <Episodes id={id} />
                    </div>
                }
            </div>
        </>
    );
};

export default WatchPage;
