import React, { useState, useEffect } from "react";
import TinderCard from "react-tinder-card";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import axios from "axios";

export default function RestaurantSwipe() {
  const [restaurants, setRestaurants] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/restaurant")
      .then((res) => {
        setRestaurants(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch restaurants", err);
      });
  }, []);

  const handleSwipe = (direction, restaurant) => {
    setSwipeDirection(direction);
    console.log(`Swiped ${direction} on ${restaurant.name}`);

    const swipeData = {
      groupId: "yourGroupIdHere",
      restaurantId: restaurant.id,
      direction,
    };

    axios.post("http://localhost:5000/swipes/save", swipeData, {
      headers: {
        Authorization: `Bearer yourAuthTokenHere`, // Add real JWT token if using auth
      },
    }).then(() => {
      console.log("Swipe saved");
    }).catch((err) => {
      console.error("Error saving swipe", err);
    });
  };

  const handleCardLeftScreen = (name) => {
    console.log(`${name} left the screen`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Swipe Restaurants 🍽️
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          height: 480,
        }}
      >
        {restaurants.map((restaurant) => (
          <TinderCard
            key={restaurant.id}
            onSwipe={(dir) => handleSwipe(dir, restaurant)}
            onCardLeftScreen={() => handleCardLeftScreen(restaurant.name)}
            preventSwipe={["up", "down"]}
          >
            <Card
              sx={{
                position: "absolute",
                width: 320,
                height: 440,
                borderRadius: 4,
                boxShadow: 6,
                backgroundColor: "#fff",
              }}
            >
              <CardMedia
                component="img"
                height="250"
                image={restaurant.image}
                alt={restaurant.name}
              />
              <CardContent>
                <Typography variant="h6">{restaurant.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ⭐ Rating: {restaurant.rating}
                </Typography>
              </CardContent>
            </Card>
          </TinderCard>
        ))}
      </Box>

      {swipeDirection && (
        <Paper elevation={3} sx={{ mt: 3, p: 2, textAlign: "center" }}>
          <Typography variant="body1">
            You swiped: <strong>{swipeDirection}</strong>
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
