import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { useParams } from 'react-router-dom';
import CommentSection from '../Preview/CommentSection/CommentSection';
import Episodes from '../Preview/SeasonSection/Episodes/Episodes';

const WatchPage = () => {
    const { id } = useParams();
    const [videoUrl, setVideoUrl] = useState('');
    const [videoType, setVideoType] = useState('');
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

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
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: '3' }}>
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
