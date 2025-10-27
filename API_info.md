# Health and Ready checks

- **Health check:**
    - *GET `${HOST}:${PORT}/health`* returns `{status: ok}` if service is running.
- **Ready check:**
    - *GET `${HOST}:${PORT}/ready`* returns `{status: ready}` if applications database is running.

# Team Info Routes

- **Getting list of all teams:**
    - *GET `${HOST}:${PORT}/info/teams`* returns an array of json objects structured as following
    ```js
    {
        team_id: number,
        team_name: string,
        team_city: string
    }[]
    ```
    - **Error: returns 404 in case of error.**
- **Getting team info by team_id:**
    - *GET `${HOST}:${PORT}/info/teams/:teamId`* returns a json object of a team with a matching team_id from the database as following
    ```js
    {
        team_id: number,
        team_name: string,
        team_city: string
    }
    ```
    - **Error:** 
        - **returns 400 if provided parameter is NaN or negative number.**
        - **returns 404 if team not found.**

- **Getting team infos by team_name:**
    - *GET `${HOST}:${PORT}/info/teams/search/name/:teamName`* returns an array of team json objects with matching team names. (`Real` as a parameter will return all team objects that have `Real` in their name).
    - **Error:** 
        - **returns 400 if no/empty parameter given.**
        - **returns 404 if not found.**

-  **Getting team infos by team_city:**
    - *GET `${HOST}:${PORT}/info/teams/search/city/:cityName`* returns an array of team json objects with matching city names. (`Los Angeles` as a parameter will return Lakers, Giants, Clippers, etc.)
    - **Error:**
        - **returns 400 if no/empty parameter given.**
        - **returns 404 if not found**

- **Adding new team to a database:**
    - *POST `${HOST}:${PORT}/info/teams` with a json object in its body given as
    ```js
    {
        team_name: "Lakers",
        city: "Los Angeles"
    }
    ```
    - **Upon successful addition of team client receives 201 with a json object `{message: 'Team added successfully', teamId: 123}.**`
    - **Error:**
        - **returns 400 on a bad request body. (Missing/invalid fields)**
        - **returns 500 upon Database error or 409 upon violation of UNIQUE constraint**

# Sport Info Routes

- **Getting Sports List:**
    - *GET `${HOST}:${PORT}/info/sports`* returns an array of sports json objects defined as
    ```js
    {
        sport_id: 123,
        sport_name: Basketball
    }
    ``` 
    - **Error:**
        - **returns 404 if sports table is empty.**

- **Adding Sports:**
    - *POST `${HOST}:${PORT}/info/sports` with request body defined as `{sport_name: string}`* adds a sport to a sports table returning json object defined as `{message: 'Sport added successfully', sportId: 123}` with status 201.
    - **Error:**
        - **returns 409 if sport already exists**
        - **returns 400 if request body is not well defined**
        - **return 500 on DB errors**

- **Getting Events based on Sports ID or Name:**
    - *GET `${HOST}:${PORT}/info/events/search/<sportID/sportName>/<:sportId/:sportName>`* returns an array of event json objects defined as
    ```js
    {
        event_id: number,
        event_time: string,
        event_date: string,
        location: string,
        home_team_name: string,
        away_team_name: string,
        sport_name: string,
        day_of_week: string,
        weekday_name: string
    }
    ```
    - **Error:**
        - **returns 404 if no events found for specific sport**
        - **returns 400 if parameters is not valid**

# Event Info Routes

- **Getting list of all events:**
    - *GET `${HOST}:${PORT}/info/events`* returns an array of json objects structured as following
    ```js
    {
        event_id: number,
        event_date: string,
        event_time: string,
        location: string,
        home_team_name: string,
        away_team_name: string,
        sport_name: string,
        day_of_week: string,
        weekday_name: string
    }[]
    ```
    - Events are ordered by date and time.

- **Getting event info by event_id:**
    - *GET `${HOST}:${PORT}/info/events/:id`* returns a json object of an event with a matching event_id from the database as following
    ```js
    {
        event_id: number,
        event_date: string,
        event_time: string,
        location: string,
        home_team_name: string,
        away_team_name: string,
        sport_name: string,
        day_of_week: string,
        weekday_name: string
    }
    ```
    - **Error:** 
        - **returns 404 if event not found.**

- **Getting events by location:**
    - *GET `${HOST}:${PORT}/info/events/search/location/:location`* returns an array of event json objects with matching location (city). (`Los Angeles` as a parameter will return all events where home team is from Los Angeles).
    - **Error:** 
        - **returns 400 if no/empty parameter given.**
        - **returns 404 if no events found.**

- **Getting events by date:**
    - *GET `${HOST}:${PORT}/info/events/search/date/:date`* returns an array of event json objects with matching date. (Date format: `YYYY-MM-DD`, e.g., `2025-10-27`)
    - **Error:**
        - **returns 400 if no/empty parameter given.**
        - **returns 404 if no events found.**

- **Getting a specific event:**
    - *GET `${HOST}:${PORT}/info/events/search/specific?date=YYYY-MM-DD&home_team_name=TeamName&away_team_name=TeamName`* returns a single event json object matching the exact date and team names.
    - Query parameters (all required):
        - `date`: Date in format `YYYY-MM-DD`
        - `home_team_name`: Exact name of home team
        - `away_team_name`: Exact name of away team
    - **Error:**
        - **returns 400 if any required parameter is missing.**
        - **returns 404 if no event found with specified criteria.**

- **Getting events by team name:**
    - *GET `${HOST}:${PORT}/info/events/search/team/:teamName`* returns an array of event json objects where the specified team is either home or away team.
    - **Error:**
        - **returns 400 if no/empty parameter given.**
        - **returns 404 if no events found.**

- **Adding new event to database:**
    - *POST `${HOST}:${PORT}/info/events`* with a json object in its body given as
    ```js
    {
        date: "2025-10-27",
        time: "19:00",
        home_team_name: "Lakers",
        home_team_city: "Los Angeles",
        away_team_name: "Warriors",
        away_team_city: "San Francisco",
        sport_name: "Basketball"
    }
    ```
    - **Upon successful addition of event client receives 201 with a json object `{event_id: 123}`.**
    - If teams or sport don't exist, they will be automatically created.
    - **Error:**
        - **returns 409 if event already exists (same teams, date, and time).**
        - **returns 500 upon Database error.**

- **Updating an event:**
    - *PUT `${HOST}:${PORT}/info/events/:id`* with a json object in its body. All fields are optional:
    ```js
    {
        date?: "2025-10-28",
        time?: "20:00",
        home_team_name?: "Lakers",
        home_team_city?: "Los Angeles",
        away_team_name?: "Celtics",
        away_team_city?: "Boston",
        sport_name?: "Basketball"
    }
    ```
    - **Upon successful update client receives 200 with `{message: 'Event updated successfully'}`.**
    - If new teams or sport don't exist, they will be automatically created.
    - **Error:**
        - **returns 404 if event not found.**
        - **returns 500 upon Database error.**

- **Deleting an event:**
    - *DELETE `${HOST}:${PORT}/info/events/:id`* deletes the event with the specified ID.
    - **Upon successful deletion client receives 200 with `{message: 'Event deleted successfully'}`.**
    - **Error:**
        - **returns 404 if event not found.**
        - **returns 500 upon Database error.**
