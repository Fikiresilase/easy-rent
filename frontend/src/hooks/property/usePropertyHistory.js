import { useState, useEffect } from 'react';
import { fetchProperties } from '../../services/property';
import { getChatRequestCounts } from '../../services/chat';

export function usePropertyHistory(user,token) {
  const [posts, setPosts] = useState([]);
  const [completedProperties, setCompletedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatRequestCounts, setChatRequestCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id || !token) {
        console.error('Missing user data for fetching history:', {
          userId: user?.id,
          token: !!user?.token,
          timestamp: new Date().toISOString(),
        });
        setError('User authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching history for user:', {
          userId: user.id,
          timestamp: new Date().toISOString(),
        });

        // Fetch user-owned properties
        const ownedPropertiesData = await fetchProperties({ ownerId: user.id });
        console.log('Owned properties data:', {
          rawResponse: ownedPropertiesData,
          type: typeof ownedPropertiesData,
          isArray: Array.isArray(ownedPropertiesData),
          isObject: typeof ownedPropertiesData === 'object' && !Array.isArray(ownedPropertiesData) && ownedPropertiesData !== null,
          timestamp: new Date().toISOString(),
        });

        let normalizedPosts = [];
        if (Array.isArray(ownedPropertiesData)) {
          normalizedPosts = ownedPropertiesData;
        } else if (typeof ownedPropertiesData === 'object' && ownedPropertiesData !== null) {
          normalizedPosts = [ownedPropertiesData];
        }

        console.log('Setting posts:', {
          postCount: normalizedPosts.length,
          posts: normalizedPosts.map((p) => ({ _id: p._id, title: p.title })),
          timestamp: new Date().toISOString(),
        });
        setPosts(normalizedPosts);

        // Fetch completed properties
        const completedPropertiesData = await fetchProperties({
          status: 'rented',
          userId: user.id, // For owner or renter
        });
        console.log('Completed properties data:', {
          rawResponse: completedPropertiesData,
          type: typeof completedPropertiesData,
          isArray: Array.isArray(completedPropertiesData),
          propertyCount: Array.isArray(completedPropertiesData) ? completedPropertiesData.length : 0,
          timestamp: new Date().toISOString(),
        });

        let normalizedCompleted = [];
        if (Array.isArray(completedPropertiesData)) {
          
          normalizedCompleted = completedPropertiesData;
        } else if (typeof completedPropertiesData === 'object' && completedPropertiesData !== null) {
          
          normalizedCompleted = [completedPropertiesData];
        }

        console.log('Setting completed properties:', {
          propertyCount: normalizedCompleted.length,
          properties: normalizedCompleted.map((p) => ({ _id: p._id, title: p.title })),
          timestamp: new Date().toISOString(),
        });
        setCompletedProperties(normalizedCompleted);

        // Fetch chat request counts
        const counts = await getChatRequestCounts();
        console.log('Chat request counts:', counts);
        setChatRequestCounts(counts);
      } catch (err) {
        console.error('Error fetching data:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
          timestamp: new Date().toISOString(),
        });
        setError('Failed to load history data');
        setPosts([]);
        setCompletedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return { posts, completedProperties, loading, error, chatRequestCounts };
}